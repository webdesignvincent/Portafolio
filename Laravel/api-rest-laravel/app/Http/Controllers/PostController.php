<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Post;
use App\Helpers\JwtAuth;

class PostController extends Controller
{
    public function __construct(){
        $this->middleware('api.auth', ['except'=> [
                'index',
                'show',
                'getImage', 
                'getPostsByCategory',
                'getPostsByUser'
        ]]);
    }

    public function index(){

        $posts = Post::all()->load('category');

        $data = array(
                'status' => 'success',
                'code'   => 200,
                'posts'  => $posts
        );

        return response()->json($data, $data['code']);

    }


    public function show($id){

        $post = Post::find($id)->load('category')
                               ->load('user');

        if(is_object($post)){
            $data = array(
                'status' => 'success',
                'code'   => 200,
                'posts'  => $post
            );
        }else{
            $data = array(
                'status'    => 'error',
                'code'      => 404,
                'message'   => 'La entrada no existe.'
            );
        }

        return response()->json($data, $data['code']);

    }

    // Comprobar si el usuario esta identificado y Sacar usuario identificado
    public function getIdentity(Request $request){
        // Creo Instancia de Jwt
        $jwtAuth = new \JwtAuth();
        // Token Enviado
        $token = $request->header('Authorization',null);
        // Sacar usuario identificado
        $user = $jwtAuth->checkToken($token,true);

        return $user;
    }


    public function store(Request $request){
        // Recoger datos por Post
        $json = $request->input('json',null);
        // Convierto en un objeto
        $params = json_decode($json);
        // Convertir en array
        $params_array = json_decode($json,true);

        if(!empty($params_array)){

            // Conseguir usuario identificado
            $user = $this->getIdentity($request);

            // Validar datos
            $validate = \Validator::make($params_array,[
                'title'       => 'required',
                'content'     => 'required',
                'category_id' => 'required',
                'image'       => 'required'
            ]);

            if($validate->fails()){
                // Mensaje error
                $data = array(
                    'status' => 'error',
                    'code'   => 404,
                    'message'  => 'No se ha guardado el post, faltan datos.'
                );
            }else{
                // Creo Instancia de post 
                $post = new Post();
                // Seteo valores
                $post->user_id = $user->sub;
                $post->category_id = $params->category_id;
                $post->title = $params->title;
                $post->content = $params->content;
                $post->image = $params->image;
                // Guardar el articulo
                $post->save();
                    // Mensaje exitoso
                    $data = array(
                        'status' => 'success',
                        'code'   => 200,
                        'posts'  => $post
                    );
            }
        }else{
            // Mensaje error
            $data = array(
                    'status'   => 'error',
                    'code'     => 404,
                    'message'  => 'Envia los datos correctamente.'
            );

        }

        return response()->json($data, $data['code']);

    }


    public function update($id, Request $request){
        // Recoger los datos por post
        $json = $request->input('json',null);
        // Convierto en un array
        $params_array = json_decode($json,true);
        // Datos para  devolver error
        $data = array(
                    'status'   => 'error',
                    'code'     => 404,
                    'message'  => 'Datos enviados incorrectamente.'
        );

        if(!empty($params_array)){
             // Validar datos
             $validate = \Validator::make($params_array,[
                 'title'       => 'required',
                 'content'     => 'required',
                 'category_id' => 'required'
             ]);
             // Existe error envio mensaje
             if($validate->fails()){
                 $data['errors'] = $validate->errors();
                 return response()->json($data, $data['code']);
             }
             // Eliminar lo que no queremos actualizar
             unset($params_array['id']);
             unset($params_array['user_id']);
             unset($params_array['created_at']);
             unset($params_array['user']);

             // Conseguir usuario identificado
             $user = $this->getIdentity($request);

             // Buscar el registro a actualizar
             $post = Post::where('id',$id)
                         ->where('user_id',$user->sub)
                         ->first();

             if(!empty($post) && is_object($post)){

                    // Actualizar el registro en concreto
                    $post->update($params_array);
                    // Mensaje exitoso
                    $data = array(
                        'status'  => 'success',
                        'code'    => 200,
                        'post'    => $post,
                        'changes' => $params_array
                    );

             }else{
                    // Mensaje error
                    $data = array(
                        'status'   => 'error',
                        'code'     => 404,
                        'message'  => 'No tienes permiso para modificar el post.'
                    );

             }

        }

        return response()->json($data, $data['code']);

    }


    public function destroy($id, Request $request){

        // Conseguir usuario identificado
        $user = $this->getIdentity($request);

        // Conseguir el registro
        $post = Post::where('id',$id)
                    ->where('user_id',$user->sub)
                    ->first();

        if(!empty($post)){
            // Borrarlo
            $post->delete();

            // Mensaje exitoso
            $data = array(
                'status'  => 'success',
                'code'    => 200,
                'post'    => $post
            );

        }else{
            // Mensaje error
            $data = array(
                'status'   => 'error',
                'code'     => 404,
                'message'  => 'El post no existe.'
            );

        }

        return response()->json($data, $data['code']);

    }


    public function upload(Request $request){

        // Recoger la imagen de la peticion
        $image = $request->file('file0');

        // Validar imagen
        $validate = \Validator::make($request->all(),[
            'file0' => 'required|image|mimes:jpg,jpeg,png,gif'
        ]);

        // Guardar la imagen
        if(!$image || $validate->fails()){
            // Mensaje error
            $data = array(
                'status'   => 'error',
                'code'     => 404,
                'message'  => 'Error al subir imagen.'
            );

        }else{
            // Nombre de imagen
            $image_name = time().$image->getClientOriginalName();
            // Guardo imagen en la ruta
            \Storage::disk('images')->put($image_name, \File::get($image));
            // Mensaje exitoso
            $data = array(
                'status'  => 'success',
                'code'    => 200,
                'image'   => $image_name
            );

        }

        return response()->json($data, $data['code']);

    }

    public function getImage($filename){

        // Comprobar si existe el fichero
        $isset = \Storage::disk('images')->exists($filename);

        if($isset){
            // Conseguir la imagen
            $file = \Storage::disk('images')->get($filename);
            // Devolver la imagen
            return new Response($file,200);
        }else{
            // Mensaje error
            $data = array(
                'status' => 'error',
                'code'   => 404,
                'message'=> 'La imagen no existe.'
            );
        }

        return response()->json($data, $data['code']);
    }


    public function getPostsByCategory($id){

        $posts = Post::where('category_id',$id)->get();

        // Mensaje exitoso
        return response()->json([
            'status' => 'success',
            'posts'  => $posts
        ],200);

    }


    public function getPostsByUser($id){

        $posts = Post::where('user_id',$id)->get();

        // Mensaje exitoso
        return response()->json([
            'status' => 'success',
            'posts' => $posts
        ],200);

    }


}

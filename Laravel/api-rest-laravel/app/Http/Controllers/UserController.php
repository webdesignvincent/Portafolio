<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\response;
use App\Models\User;

class UserController extends Controller
{
    
    public function register(Request $request){
        // Recoger los datos del usuario por Post
        $json = $request->input('json', null);
        // Convierto en un objeto
        $params = json_decode($json); 
        // Convierto en un array
        $params_array = json_decode($json, true); 

        if(!empty($params) && !empty($params_array)){
            // Limpiar datos
            $params_array = array_map('trim', $params_array);
            // Validar datos
            $validate = \Validator::make($params_array,[
                'name'     =>   'required|alpha',
                'surname'  =>   'required|regex:([a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+)',
                'email'    =>   'required|email|unique:users',
                'password' =>   'required',
            ]);

                if($validate->fails()){
                    // Validacion ha fallado
                    $data = array(
                        'status' => 'error',
                        'code'   => 404,
                        'message'=> 'El usuario no se ha creado',
                        'errors' => $validate->errors()
                    );
                }else{
                    // Cifrar la contraseña
                    $pwd = hash('sha256', $params->password);

                    // Crear instancia del usuario
                    $user = new User();
                    
                    // Seteo valores
                    $user->name = $params_array['name'];
                    $user->surname = $params_array['surname'];
                    $user->role = 'ROLE_USER';
                    $user->email = $params_array['email']; 
                    $user->password = $pwd;
                    
                    // Guardar el usuario
                    $user->save();

                    // Mensaje exitoso
                    $data = array(
                        'status' => 'success',
                        'code'   => 200,
                        'message'=> 'El usuario se ha creado correctamente.', 
                        'user'   => $user
                    );
                }

        }else{
                $data = array(
                        'status' => 'error',
                        'code'   => 404,
                        'message'=> 'Los datos enviados no son correctos.',
                );
        }

        return response()->json($data, $data['code']);

    }


    public function login(Request $request){
        // Creo Instancia de Jwt
        $jwtAuth = new \JwtAuth();
        // Recoger los datos del usuario por Post
        $json = $request->input('json', null);
        // Convierto en un objeto
        $params = json_decode($json); 
        // Convierto en un array
        $params_array = json_decode($json, true);
        
            // Validar datos
            $validate = \Validator::make($params_array,[
                'email'    =>   'required|email',
                'password' =>   'required'
            ]);

            if($validate->fails()){
                // Validacion ha fallado
                $signup = array(
                    'status' => 'error',
                    'code'   => 404,
                    'message'=> 'El usuario no se ha podido identificar.',
                    'errors' => $validate->errors()
                 );
            }else{
                // Cifrar la contraseña
                $pwd = hash('sha256', $params->password);

                if(!empty($params->getToken)){
                    // Devolver datos
                    $signup = $jwtAuth->signup($params->email, $pwd, true);
                }else{
                    // Devolver token
                    $signup = $jwtAuth->signup($params->email, $pwd);
                }

            }

        return response()->json($signup,200);
    }


    public function detail($id){

        $user = User::find($id);

        if(is_object($user)){
            $data = array(
                'status' => 'success',
                'code'   => 200,
                'user'   => $user
            );
        }else{
            $data = array(
                'status' => 'error',
                'code'   => 404,
                'message'=> 'El usuario no existe.'
            );
        }

        return response()->json($data, $data['code']);

    }


    public function update(Request $request){
        // Creo Instancia de Jwt
        $jwtAuth = new \JwtAuth();
        // Token Enviado
        $token = $request->header('Authorization');
        // Sacar Token
        $checkToken = $jwtAuth->checkToken($token); 
        // Recoger los datos por post 
        $json = $request->input('json',null);
        // Convertir en array
        $params_array = json_decode($json, true); 

        if($checkToken && !empty($params_array)){
            // Sacar usuario identificado
            $user = $jwtAuth->checkToken($token, true);
            // Validar datos
            $validate = \Validator::make($params_array,[
                'name'     =>   'required|alpha',
                'surname'  =>   'required|regex:([a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+)',
                'email'    =>   'required|email|unique:users,'.$user->sub
            ]);
            // Quitar los campos que no quiero actualizar
            unset($params_array['id']);
            unset($params_array['role']);
            unset($params_array['password']);
            unset($params_array['created_at']);
            unset($params_array['remember_token']);
            // Actualizar usuario
            $user_update = User::where('id', $user->sub)->update($params_array);
            // Devolver array con resultado
            $data = array(
                'status' => 'success',
                'code'   => 200,
                'user'   => $user,
                'changes'=> $params_array
            );

        }else{
            $data = array(
                'status' => 'error',
                'code'   => 404,
                'message'=> 'El usuario no esta identificado.'
            );
        }

        return response()->json($data, $data['code']);
    }


    public function upload(Request $request){
        // Recoger datos de la peticion
        $image = $request->file('file0');
        // Validar imagen
        $validate = \Validator::make($request->all(),[
                'file0'     =>   'required|image|mimes:jpg,jpeg,png,gif'
        ]);
        // Guardar imagen
        if(!$image || $validate->fails()){

            $data = array(
                'status' => 'error',
                'code'   => 400,
                'message'=> 'Error al subir imagen.'
            );

        }else{

            $image_name = time().$image->getClientOriginalName();
            \Storage::disk('users')->put($image_name, \File::get($image));

            $data = array(
                'status' => 'success',
                'code'   => 200,
                'image'  => $image_name
            );

        } 

        return response()->json($data, $data['code']);
    }


    public function getImage($filename){

        $isset = \Storage::disk('users')->exists($filename);

        if($isset){
            $file = \Storage::disk('users')->get($filename);
            return new Response($file,200);
        }else{
            $data = array(
                'status' => 'error',
                'code'   => 404,
                'message'=> 'La imagen no existe.'
            );
        }

        return response()->json($data, $data['code']);
    }

}

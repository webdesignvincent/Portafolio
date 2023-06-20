<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Category;

class CategoryController extends Controller
{
    public function __construct(){
        $this->middleware('api.auth', ['except'=> ['index','show']]);
    }

    public function index(){

        $categories = Category::all();

        $data = array(
                'status' => 'success',
                'code'   => 200,
                'categories'   => $categories
        );

        return response()->json($data, $data['code']);

    }


    public function show($id){

        $category = Category::find($id);

        if(is_object($category)){
            $data = array(
                'status'    => 'success',
                'code'      => 200,
                'category'  => $category
            );
        }else{
            $data = array(
                'status' => 'error',
                'code'   => 404,
                'message'=> 'La categoria no existe.'
            );
        }

        return response()->json($data, $data['code']);

    }


    public function store(Request $request){
        // Recoger los datos por post
        $json = $request->input('json', null);
        // Convierto en un array
        $params_array = json_decode($json, true);

        if(!empty($params_array)){
            // Validar los datos
            $validate = \Validator::make($params_array,[
                'name' => 'required'
            ]);

            if($validate->fails()){
                $data = array(
                    'status' => 'error',
                    'code'   => 404,
                    'message'=> 'No se ha guardado la categoria.'
                );
            }else{
                // Guardar la categoria
                $category = new Category();
                $category->name = $params_array['name'];
                $category->save();

                $data = array(
                    'status' => 'success',
                    'code'   => 200,
                    'category'=> $category
                );
            }
        }else{
            $data = array(
                    'status' => 'error',
                    'code'   => 404,
                    'message'=> 'No has enviado ninguna categoria.'
            );
        }
        // Devolver resultado
        return response()->json($data, $data['code']);
    }


    public function update($id, Request $request){
        // Recoger datos por post
        $json = $request->input('json',null);
        // Convierto en un array
        $params_array = json_decode($json,true);

        if(!empty($params_array)){

            // Validar datos
            $validate = \Validator::make($params_array,[
                'name' => 'required'
            ]);

            // Quitar lo que no quiero actualizar
            unset($params_array['id']);
            unset($params_array['created_at']);

            // Actualizar el registro
            $category = Category::where('id',$id)->update($params_array);

            $data = array(
                    'status' => 'success',
                    'code'   => 200,
                    'category'=> $params_array
            );

        }else{
            $data = array(
                    'status' => 'error',
                    'code'   => 404,
                    'message'=> 'No has enviado ninguna categoria.'
            );
        }
        // Devolver resultado
        return response()->json($data, $data['code']);
    }

}

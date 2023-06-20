<?php

use Illuminate\Support\Facades\Route;
// Cargar Middleware
use App\Http\middleware\ApiAuthMiddleware;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

//RUTAS DE PRUEBA
Route::get('/', function () {
    return view('welcome');
});

Route::get('/prueba', function () {
    return '<h2>Texto desde una Ruta</h2>';
});

Route::get('/prueba-parametro/{nombre?}', function ($nombre = null) {

    $texto = '<h2>Texto desde una Ruta</h2>';
    $texto .= 'Nombre:'.$nombre;

    return $texto;
});

Route::get('/prueba-parametro-view/{nombre?}', function ($nombre = null) {

    $texto = '<h2>Texto desde una Ruta con View</h2>';
    $texto .= 'Nombre:'.$nombre;

    return view('pruebas',array(
        'texto' => $texto
    ));
});

Route::get('/animales', 'App\Http\Controllers\PruebasController@index');
Route::get('/test-orm', 'App\Http\Controllers\PruebasController@testOrm');

//RUTAS DEL API
    
    /*
        Metodos HTTP comunes
        GET: Conseguir datos o recursos
        POST: Guardar datos o recursos o hacer logica desde un formulario
        PUT: Actualizar datos o recursos
        DELETE: Eliminar datos o recursos
    */

// Rutas de prueba
// Route::get('/usuario/pruebas', 'App\Http\Controllers\UserController@pruebas');
// Route::get('/categoria/pruebas', 'App\Http\Controllers\CategoryController@pruebas');
// Route::get('/entrada/pruebas', 'App\Http\Controllers\PostController@pruebas');

// Rutas del Controlador de Usuarios
Route::post('/api/register', 'App\Http\Controllers\UserController@register');
Route::post('/api/login', 'App\Http\Controllers\UserController@login');
Route::put('/api/user/update', 'App\Http\Controllers\UserController@update');
Route::post('/api/user/upload', 'App\Http\Controllers\UserController@upload')->middleware(ApiAuthMiddleware::class);
Route::get('/api/user/avatar/{filename}', 'App\Http\Controllers\UserController@getImage');
Route::get('/api/user/detail/{id}', 'App\Http\Controllers\UserController@detail');

// Rutas del Controlador de Categorias
Route::resource('/api/category','App\Http\Controllers\CategoryController');

// Rutas del Controlador de Post
Route::resource('/api/post','App\Http\Controllers\PostController');
Route::post('/api/post/upload', 'App\Http\Controllers\PostController@upload')->middleware(ApiAuthMiddleware::class);
Route::get('/api/post/image/{filename}', 'App\Http\Controllers\PostController@getImage');
Route::get('/api/post/category/{id}', 'App\Http\Controllers\PostController@getPostsByCategory');
Route::get('/api/post/user/{id}', 'App\Http\Controllers\PostController@getPostsByUser');

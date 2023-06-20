<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ApiAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Token Enviado
        $token = $request->header('Authorization');

        // Creo Instancia de Jwt
        $jwtAuth = new \JwtAuth();
        
        // Sacar Token
        $checkToken = $jwtAuth->checkToken($token);

        if($checkToken){
            return $next($request);
        }else{
            
            $data = array(
                'status' => 'error',
                'code'   => 400,
                'message'=> 'El usuario no esta identificado.'
            );

            return response()->json($data, $data['code']);
        }

    }

}

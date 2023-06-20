<?php
namespace App\Services;

use Firebase\JWT\JWT;
use App\Entity\User;

class JwtAuth{

    public $manager;
    public $key;

    public function __construct($manager)
    {
        $this->manager = $manager;
        $this->key = 'hola_este_es_el_master_full_stack_7';
    }

    public function signup($email, $password, $gettoken =null){

        // Comprobar si el usuario existe
        $user = $this->manager->getRepository(User::class)->findOneBy([
            'email' => $email,
            'password' => $password
        ]);

        $signup = false;
        if(is_object($user)){
            $signup = true;            
        }

        // Si existe, generar el token de JWT
        if($signup){
            $token = [
                    'sub' => $user->getId(),
                    'name' => $user->getName(),
                    'surname' => $user->getSurname(),
                    'email' => $user->getEmail(),
                    'iat' => time(),
                    'exp' => time()+(7*24*60*60)
            ];

            // Genero el token
            $jwt = JWT::encode($token , $this->key, 'HS256');

            // Decodifico el token
            $decoded = JWT::decode($jwt , $this->key, ['HS256']);

            if(!empty($gettoken)){
                $data = $jwt;
            }else{
                $data = $decoded;
            }

        }else{
            $data =[
                'status' => 'error',
                'code' => 400,
                'message' => 'Login Incorrecto'
            ];
        }

        return $data;
    }

    public function checkToken($jwt, $getIdentity = false){

        $auth = false;

        try{
			$decoded = JWT::decode($jwt, $this->key, ['HS256']);
		}catch(\UnexpectedValueException $e){
			$auth = false;
		}catch(\DomainException $e){
			$auth = false;
		}

        if(isset($decoded) && !empty($decoded) && is_object($decoded) && isset($decoded->sub)){
			$auth = true;
		}else{
			$auth = false;
		}

		if($getIdentity != false){
			return $decoded;
		}else{
            return $auth;
        }

    }

}
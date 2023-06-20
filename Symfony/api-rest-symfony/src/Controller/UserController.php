<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

use App\Entity\User;
use App\Services\JwtAuth;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Validator\Validation;
use Symfony\Component\Validator\Constraints\Email;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;

class UserController extends AbstractController
{
    private $em;
    private $doctrine;
    /**
     * @param $em
     * @param $doctrine
     */
    public function __construct(EntityManagerInterface $em,ManagerRegistry $doctrine)
    {
        $this->em = $em;    
        $this->doctrine = $doctrine;
    }


    public function index(): JsonResponse
    {
        $user_repo = $this->em->getRepository(User::class);
        $users = $user_repo->findAll();

        $data = [
            'message' => 'Welcome to your new controller,Hello world!',
            'path' => 'src/Controller/UserController.php',
            'users' => $users
        ];

        return new JsonResponse($data);
    }


    public function create(Request $request): JsonResponse
    {
        // Recoger los datos por post
        $json = $request->get('json', null);

        // Decodificar el JSON
        $params = json_decode($json);

        // Array de respuesta por defecto
        $data = [
            'status' => 'error',
            'code'   =>  400,
            'message'=> 'El usuario no se ha creado.',
            'json' => $params
        ];

        // Comprobar y validar datos
        if($json != null){
            $name = (!empty($params->name)) ? $params->name : null;
            $surname = (!empty($params->surname)) ? $params->surname : null;
            $email = (!empty($params->email)) ? $params->email : null;
            $password = (!empty($params->password)) ? $params->password : null;

            $validate = Validation::createValidator();
            $validate_email = $validate->validate($email,[
                new Email()
            ]);

            if(!empty($email) && count($validate_email) ==0 && !empty($password) && !empty($name) && !empty($surname)){
                
                // Si la validacion es correcta, crear el objeto del usuario
                $user = new User();
                $user->setName($name);
                $user->setSurname($surname);
                $user->setEmail($email);
                $user->setRole('ROLE_USER');
                $user->setCreatedAt(new \DateTime('now'));

                // Cifrar la contraseña
                $pwd = hash('sha256', $password);
                $user->setPassword($pwd);

                // Buscar/Comprobar si el usuario existe (duplicados)
                $user_repo = $this->em->getRepository(User::class);
                $isset_user = $user_repo->findBy(array(
                    'email' => $email
                ));

                // Si no existe,guardo en la db
                if(count($isset_user)==0){
                        // Guardar el usuario
                        $entityManager = $this->doctrine->getManager();
                        $entityManager->persist($user);
                        $entityManager->flush();

                        // Respuesta
                        $data = [
                            'status' => 'success',
                            'code'   =>  200,
                            'message'=> 'Usuario creado correctamente.',
                            'user'   => $user
                        ];

                }else{
                        // Respuesta 
                        $data = [
                            'status' => 'error',
                            'code'   =>  400,
                            'message'=> 'El usuario: '.$email.' ya se encuentra registrado.'
                        ];
                }

            }
        }
        // Hacer respuesta en JSON
        return new JsonResponse($data);
    }


    public function login(Request $request, JwtAuth $jwt_auth): JsonResponse{
        // Recoger los datos por post
        $json = $request->get('json', null);

        // Decodificar el JSON
        $params = json_decode($json);

        // Array por defecto para devolver
        $data = [
            'status' => 'error',
            'code'   =>  400,
            'message'=> 'El usuario no se ha podido identificar'
        ];

        // Comprobary validar datos
        if($json !=null){
            $email = (!empty($params->email)) ? $params->email : null;
            $password = (!empty($params->password)) ? $params->password : null;
            $gettoken = (!empty($params->gettoken))  ? $params->gettoken : null;

            $validate = Validation::createValidator();
            $validate_email = $validate->validate($email,[
                new Email()
            ]);

            if(!empty($email) && !empty($password) && count($validate_email)==0){
                // Cifrar la contraseña
                $pwd = hash('sha256', $password);

                if($gettoken == 'true'){
                    $signup = $jwt_auth->signup($email, $pwd, $gettoken);
                }else{
                    $signup = $jwt_auth->signup($email, $pwd);
                }
                // Hacer respuesta en JSON
                return new JsonResponse($signup);                          
            }

        }

    }


    public function edit(Request $request, JwtAuth $jwt_auth): JsonResponse{
        // Recoger la cabecera de autenticacion
        $token = $request->headers->get('Authorization');

        // Crear un metodo para comprobar si el token es correcto
        $authCheck = $jwt_auth->checkToken($token);

        // Conseguir usuario identificado
        $identity = $jwt_auth->checkToken($token,true);

        // Recoger los datos por post
        $json = $request->get('json', null);

        // Decodificar el JSON
        $params = json_decode($json);

        // Respuesta por defecto
        $data = [
            'status' => 'error',
            'code'   => 400,
            'message'=> 'Usuario no actualizado'
        ];

        // Si es correcto, hacer la actualizacion del usuario
        if($authCheck){

            // Conseguir el usuario a actualizar
            $user_repo = $this->em->getRepository(User::class);
            $user = $user_repo->findOneBy([
                'id' => $identity->sub
            ]);

            // Comprobar y validar datos
            if(!empty($json)){

                $name = (!empty($params->name)) ? $params->name : null;
                $surname = (!empty($params->surname)) ? $params->surname : null;
                $email = (!empty($params->email)) ? $params->email : null;

                $validate = Validation::createValidator();
                $validate_email = $validate->validate($email,[
                    new Email()
                ]);

                if(!empty($email) && count($validate_email) ==0 && !empty($name) && !empty($surname)){
                      // Asignar los nuevos datos
                      $user->setName($name);
                      $user->setSurname($surname);
                      $user->setEmail($email);

                      // Buscar/Comprobar si el usuario existe (duplicados)
                      $isset_user = $user_repo->findBy(array(
                            'email' => $email
                      ));

                      // Si no existe,guardo en la db
                      if(count($isset_user)==0 || $identity->email == $email){

                            // Conseguir el entity manager y Guardar el usuario
                            $entityManager = $this->doctrine->getManager();
                            $entityManager->persist($user);
                            $entityManager->flush();

                            // Respuesta
                            $data = [
                                'status' => 'success',
                                'code'   =>  200,
                                'message'=> 'Usuario actualizado correctamente.',
                                'user'   => $user
                            ];

                      }else{
                            // Respuesta 
                            $data = [
                                'status' => 'error',
                                'code'   =>  400,
                                'message'=> 'El usuario: '.$email.' ya existe, no puedes usar el email.'
                            ];
                       }

                }

            }
            
        }

        // Hacer respuesta en JSON
        return new JsonResponse($data); 

    }
    
}

<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;

use App\Entity\User;
use App\Entity\Video;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Validation;
use Symfony\Component\Validator\Constraints\Email;
use Doctrine\Persistence\ManagerRegistry;
use App\Services\JwtAuth;
use Knp\Component\Pager\PaginatorInterface;

class VideoController extends AbstractController
{
    private $em;
    /**
     * @param $em
     */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;  
    }

    public function index(): JsonResponse
    {
        return $this->json([
            'message' => 'Welcome to your new controller, Hello World!',
            'path' => 'src/Controller/VideoController.php',
        ]);
    }

    public function create(Request $request, JwtAuth $jwt_auth,ManagerRegistry $doctrine, $id=null): JsonResponse{

        //Recoger el token
        $token = $request->headers->get('Authorization', null);

        // Comprobar si es correcto
        $authCheck = $jwt_auth->checkToken($token);

        // Array por defecto para devolver
        $data = [
            'status' => 'error',
            'code'   =>  400,
            'message'=> 'El video no se pudo agregar a la coleccion.'
        ];

        if($authCheck){
            // Recoger los datos por post
            $json = $request->get('json', null);

            // Decodificar el JSON
            $params = json_decode($json);

            // Conseguir usuario identificado
            $identity = $jwt_auth->checkToken($token,true);

            if(!empty($json)){

                $user_id = ($identity->sub !=null) ? $identity->sub : null;
                $title = (!empty($params->title)) ? $params->title : null;
                $description = (!empty($params->description)) ? $params->description : null;
                $url = (!empty($params->url)) ? $params->url : null;

                if(!empty($user_id) && !empty($title)){

                    // Conseguir el usuario
                    $user = $this->em->getRepository(User::class)->findOneBy([
                        'id' => $identity->sub
                    ]);

                    // Conseguir el EntityManager
                    $entityManager = $doctrine->getManager();

                    if($id == null){
                            // Crear el objeto
                            $video = new Video();
                            $video->setUser($user);
                            $video->setTitle($title);
                            $video->setDescription($description);
                            $video->setUrl($url);
                            $video->setStatus('Normal');

                            $createdAt = new \Datetime('now');
                            $updatedAt = new \Datetime('now');
                            $video->setCreatedAt($createdAt);
                            $video->setUpdatedAt($updatedAt);

                            // Guardar el usuario
                            $entityManager->persist($video);
                            $entityManager->flush();

                              // Respuesta
                              $data = [
                                    'status' => 'success',
                                    'code'   =>  200,
                                    'message'=> 'Video creado correctamente.',
                                    'video'   => $video
                              ];
                    }else{

                            // Conseguir usuario identificado
                            $identity = $jwt_auth->checkToken($token,true);

                            // Sacar el objeto del video en base a la url
                            $video = $this->em->getRepository(Video::class)->findOneBy([
                                'id'  => $id,
                                'user'=> $identity->sub
                            ]);

                            if($video && is_object($video)){

                                $video->setTitle($title);
                                $video->setDescription($description);
                                $video->setUrl($url);

                                $updatedAt = new \Datetime('now');
                                $video->setUpdatedAt($updatedAt);

                                // Guardar el cambio
                                $entityManager->persist($video);
                                $entityManager->flush();

                                // Respuesta
                                $data = [
                                    'status' => 'success',
                                    'code'   =>  200,
                                    'message'=> 'Video actualizado correctamente.',
                                    'video'   => $video
                                ];

                            }else{
                                // Respuesta
                                $data = [
                                    'status' => 'error',
                                    'code'   =>  400,
                                    'message'=> 'No tienes permiso para actualizar video.',
                                    'video'   => $video
                                ];

                            }

                    }

                }

            }

        }
        // Hacer respuesta en JSON
        return new JsonResponse($data);
    }

    public function videos(Request $request, JwtAuth $jwt_auth, PaginatorInterface $paginator): JsonResponse{

        // Recoger la cabecera de autenticacion
        $token = $request->headers->get('Authorization');

        // Comprobar el token
        $authCheck = $jwt_auth->checkToken($token);

        // Si es valido
        if($authCheck){
            // Conseguir la identidad del usuario
            $identity = $jwt_auth->checkToken($token, true);
            
            //Hacer una consulta para paginar
            $dql = "SELECT v FROM App\Entity\Video v WHERE v.user = {$identity->sub} ORDER BY v.id DESC";
            $query = $this->em->createQuery($dql);
          
            // Recoger el parametro page de la url
            $page = $request->query->getInt('page', 1);
            $items_per_page = 6;

            // Invocar paginacion
            $pagination = $paginator->paginate($query, $page, $items_per_page);
            $total = $pagination->getTotalItemCount();

            $ap = $query->getArrayResult();
            // Respuesta
            $data = array(
                'status'             => 'success',
                'code'               =>  200,
                'total_items_count'  => $total,
                'page_actual'        => $page,
                'items_per_page'     => $items_per_page,
                'total_pages'        => ceil($total/$items_per_page),
                'pagination'         => $ap,
                'user_id'            => $identity->sub
            );

        }else{
              // Respuesta
              $data = array(
                    'status' => 'error',
                    'code'   =>  404,
                    'message'=> 'No se pueden listar los videos en este momento'
              );

        }
        // Hacer respuesta en JSON
        return new JsonResponse($data);
    }

    public function video(Request $request, JwtAuth $jwt_auth, $id=null): JsonResponse{

        // Sacar el token y comprobar si es correcto
        $token = $request->headers->get('Authorization');
        $authCheck = $jwt_auth->checkToken($token);

        // Respuesta por defecto
        $data = array(
            'status' => 'error',
            'code'   =>  404,
            'message'=> 'Video no encontrado'
        );

        if($authCheck){
            // Conseguir usuario identificado
            $identity = $jwt_auth->checkToken($token,true);

            // Sacar el objeto del video en base a la url
            $video = $this->em->getRepository(Video::class)->findOneBy([
                'id' => $id
            ]);

            if($video && is_object($video) && $identity->sub == $video->getUser()->getId()){
                 // Respuesta
                $data = array(
                    'status' => 'success',
                    'code'   =>  200,
                    'video'=> $video
                );

            }
        }

        // Hacer respuesta en JSON
        return new JsonResponse($data);

    }

    public function remove(Request $request, JwtAuth $jwt_auth, $id=null,ManagerRegistry $doctrine): JsonResponse{

        // Sacar el token y comprobar si es correcto
        $token = $request->headers->get('Authorization');
        $authCheck = $jwt_auth->checkToken($token);

        // Respuesta por defecto
        $data = array(
            'status' => 'error',
            'code'   =>  404,
            'message'=> 'No se pudo eliminar el video ya que no existe'
        );

        if($authCheck){

            $identity = $jwt_auth->checkToken($token, true);

            // Sacar el objeto del video en base a la url
            $video = $this->em->getRepository(Video::class)->findOneBy([
                'id' => $id
            ]);

            if($video && is_object($video) && $identity->sub == $video->getUser()->getId()){

                // Guardar cambios
                $entityManager = $doctrine->getManager();
                $entityManager->remove($video);
                $entityManager->flush();

                // Respuesta
                $data = array(
                   'status' => 'success',
                   'code'   =>  200,
                   'message'=> 'Video Eliminado',
                   'video'  =>  $video
                );
           }
           
        }

        // Hacer respuesta en JSON
        return new JsonResponse($data);

    }

}

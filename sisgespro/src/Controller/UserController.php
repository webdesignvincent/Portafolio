<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;
use App\Entity\User;
use App\Entity\Project;
use App\Entity\Task;
use App\Entity\Client;
use App\Form\RegisterType;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;


class UserController extends AbstractController
{

	public function index(): Response
    {
    	$user_repo = $this->getDoctrine()->getRepository(User::class);
    	$users = $user_repo->findBy([], ['id' => 'DESC']);

        return $this->render('user/index.html.twig', [
            'users' => $users,
        ]);
    }

	public function register(Request $request, UserPasswordEncoderInterface $encoder, SluggerInterface $slugger)
    {
    	// Creo Instancia
    	$user = new User();
		// Crear formulario
		$form = $this->createForm(RegisterType::class, $user);
		// Rellenar el objeto con los datos del form
		$form->handleRequest($request);
		// Comprobar si el form se ha enviado
		if($form->isSubmitted() && $form->isValid()){
			// Modificando el objeto para guardarlo
			$user->setRole('ROLE_USER');
			$user->setCreatedAt(new \Datetime('now'));
			// Cifrar contraseña
			$encoded = $encoder->encodePassword($user, $user->getPassword());
			$user->setPassword($encoded);
            // Image
			$brochureFile = $form->get('image')->getData();
            // this condition is needed because the 'brochure' field is not required
            // so the PDF file must be processed only when a file is uploaded
            if ($brochureFile) {

                $originalFilename = pathinfo($brochureFile->getClientOriginalName(), PATHINFO_FILENAME);
                // this is needed to safely include the file name as part of the URL
                $safeFilename = $slugger->slug($originalFilename);
                $newFilename = $safeFilename.'-'.uniqid().'.'.$brochureFile->guessExtension();

                // Move the file to the directory where brochures are stored
                try {
                    	$brochureFile->move($this->getParameter('images_directory'),$newFilename);
                    }catch (FileException $e){
                   		throw new Exception(message,'UPS! Ha ocurrido un error'); 
                    }
                // updates the 'brochureFilename' property to store the PDF file name
                // instead of its contents
                $user->setImage($newFilename);
            }		
			// Guardar usuario
			$em = $this->getDoctrine()->getManager();
			$em->persist($user);
			$em->flush();
			
			return $this->redirectToRoute('login');
		}
		
        return $this->render('user/register.html.twig', [
			'form' => $form->createView()
        ]);
    }


    public function login(AuthenticationUtils $autenticationUtils){

		$error = $autenticationUtils->getLastAuthenticationError();
		
		$lastUsername = $autenticationUtils->getLastUsername();

		// Consulta a la tabla Users
		$user_repo = $this->getDoctrine()->getRepository(User::class);
		$users = $user_repo->findALL(['id' => 'DESC']);

		// Consulta a la tabla Clients
		$client_repo = $this->getDoctrine()->getRepository(Client::class);
		$clients = $client_repo->findAll(['id' => 'DESC']);

		// Consulto la tabla Projects
		$project_repo = $this->getDoctrine()->getRepository(Project::class);
		$projects = $project_repo->findALL(['id' => 'DESC']);

		// Consulta a la tabla Tasks
		$task_repo = $this->getDoctrine()->getRepository(Task::class);
		$tasks = $task_repo->findALL(['id' => 'DESC']);

		$connection = $this->getDoctrine()->getConnection();
		$sql ="select distinct ta.id,ta.project_id,ta.content,ta.phase from projects pro,tasks ta ";
		$prepare = $connection->prepare($sql);
		$prepare->execute();
		$progress = $prepare->fetchAll();

	
		return $this->render('user/login.html.twig', array(
			'error' => $error,
			'last_username' => $lastUsername,
			'users' => $users,
			'clients' => $clients,
            'projects' => $projects,
            'tasks' => $tasks,
            'projects_progress' => $progress
		));
		
	}


	public function detail(User $user){

		if(!$user){
			return $this->redirectToRoute('users');
		}else{
			
            $id = $user->getId();
            
			$connection = $this->getDoctrine()->getConnection();
    	    $sql="SELECT distinct c.id,c.company_name,p.project_name,p.content,p.phase as 'phase_proyecto',p.priority as 'priority_project' ";
    	    $sql .=" ,t.title,t.content,t.priority as 'priority_task',t.phase as 'phase_task',t.hours FROM clients c ";
    	    $sql .= " inner join projects p on c.id = p.client_id ";
    	    $sql .= " inner join tasks t on p.id = t.project_id ";
    	    $sql .= " inner join users u on u.id = t.user_id ";
    	    $sql .= " where c.id = $id ";
    	    $sql .= " ORDER BY p.id DESC,t.id DESC ";

    	    $prepare = $connection->prepare($sql);
    	    $prepare->execute();
    	    $projects = $prepare->fetchAll();

    	    return $this->render('user/detail.html.twig',[
			'user' => $user,
			'projects' => $projects
		    ]);
		}	
	}


	public function edit(Request $request, UserInterface $user, UserPasswordEncoderInterface $encoder, SluggerInterface $slugger){

		if(!$user || $user->getId() == null){
			return $this->redirectToRoute('users');
		}
		
		$form = $this->createForm(RegisterType::class, $user);
		
		$form->handleRequest($request);
		
		if($form->isSubmitted() && $form->isValid()){
			
			// Cifrar contraseña
			$encoded = $encoder->encodePassword($user, $user->getPassword());
			$user->setPassword($encoded);

			$brochureFile = $form->get('image')->getData();
            // this condition is needed because the 'brochure' field is not required
            // so the PDF file must be processed only when a file is uploaded
            if ($brochureFile) {
            	
                $originalFilename = pathinfo($brochureFile->getClientOriginalName(), PATHINFO_FILENAME);
                // this is needed to safely include the file name as part of the URL
                $safeFilename = $slugger->slug($originalFilename);
                $newFilename = $safeFilename.'-'.uniqid().'.'.$brochureFile->guessExtension();

                // Move the file to the directory where brochures are stored
                try {
                      $brochureFile->move($this->getParameter('images_directory'),$newFilename);
                } catch (FileException $e) {
                   throw new Exception(message,'UPS! Ha ocurrido un error'); 
                }

                // updates the 'brochureFilename' property to store the PDF file name
                // instead of its contents
                $user->setImage($newFilename);
            }

			// Guardar usuario
			$em = $this->getDoctrine()->getManager();
			$em->persist($user);
			$em->flush();
			
			return $this->redirect($this->generateUrl('users',['id' => $user->getId()]));
		}
		
		return $this->render('user/register.html.twig',[
			'edit' => true,
			'form' => $form->createView()
		]);
	}

}

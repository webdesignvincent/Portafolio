<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\User;
use App\Entity\Project;
use App\Entity\Task;
use App\Entity\Client;
use App\Form\RegisterClientType;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;

class ClientController extends AbstractController
{

    public function index(): Response
    {
    	$client_repo = $this->getDoctrine()->getRepository(Client::class);
    	$clients = $client_repo->findBy([], ['id' => 'DESC']);
    	
        return $this->render('client/index.html.twig', [
            'clients' => $clients
        ]);
    }


    public function register(Request $request, SluggerInterface $slugger)
    {
		// Crear formulario
		$client = new Client();
		$form = $this->createForm(RegisterClientType::class, $client);
		
		// Rellenar el objeto con los datos del form
		$form->handleRequest($request);
		
		// Comprobar si el form se ha enviado
		if($form->isSubmitted() && $form->isValid()){

			// Modificando el objeto para guardarlo
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
                    $brochureFile->move(
                        $this->getParameter('images_directory'),
                        $newFilename
                    );
                } catch (FileException $e) {
                   throw new Exception(message,'UPS! Ha ocurrido un error'); 
                }

                // updates the 'brochureFilename' property to store the PDF file name
                // instead of its contents
                $client->setImage($newFilename);
            }

            $client->setCreatedAt(new \Datetime('now'));

			// Guardar usuario
			$em = $this->getDoctrine()->getManager();
			$em->persist($client);
			$em->flush();
			
			return $this->redirectToRoute('clients');
		}
		
        return $this->render('client/register.html.twig', [
			'form' => $form->createView()
        ]);
    }


    public function detail(Client $client){

		if(!$client){
			return $this->redirectToRoute('clients');
		}else{
            
            $id = $client->getId();
			$connection = $this->getDoctrine()->getConnection();

    	    $sql="SELECT distinct c.id,c.company_name,p.project_name,p.content,p.phase as 'phase_proyecto',p.priority as 'priority_project' ";
    	    $sql .=" ,t.title,t.content,t.priority as 'priority_task',t.phase as 'phase_task',t.hours FROM clients c ";
    	    $sql .= " inner join projects p on c.id = p.client_id ";
    	    $sql .= " inner join tasks t on p.id = t.project_id ";
    	    $sql .= " where c.id = $id ";
    	    $sql .= " ORDER BY p.id DESC,t.id DESC ";

    	    $prepare = $connection->prepare($sql);
    	    $prepare->execute();
    	    $projects = $prepare->fetchAll();

    	    return $this->render('client/detail.html.twig',[
			      'client' => $client,
			      'projects' => $projects
		    ]);
		}	
	}


		public function edit(Request $request, Client $client, SluggerInterface $slugger){

		if(!$client || $client->getId() == null){
			return $this->redirectToRoute('clients');
		}
		
		$form = $this->createForm(RegisterClientType::class, $client);
		
		$form->handleRequest($request);
		
		if($form->isSubmitted() && $form->isValid()){
			
			// Modificando el objeto para guardarlo
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
                    $brochureFile->move(
                        $this->getParameter('images_directory'),
                        $newFilename
                    );
                } catch (FileException $e) {
                   throw new Exception(message,'UPS! Ha ocurrido un error'); 
                }

                // updates the 'brochureFilename' property to store the PDF file name
                // instead of its contents
                $client->setImage($newFilename);
            }

			// Guardar usuario
			$em = $this->getDoctrine()->getManager();
			$em->persist($client);
			$em->flush();
			
			return $this->redirectToRoute('clients');
		}
		
		return $this->render('user/register.html.twig',[
			   'edit' => true,
			   'form' => $form->createView()
		]);
	}

}

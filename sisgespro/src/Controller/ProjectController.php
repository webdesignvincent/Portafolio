<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\User;
use App\Entity\Project;
use App\Entity\Task; 
use App\Entity\Client;
use App\Form\ProyectType;
use Symfony\Component\Security\Core\User\UserInterface;

class ProjectController extends AbstractController
{
    public function projects(): Response
    {

        $project_repo = $this->getDoctrine()->getRepository(Project::class);
        $projects = $project_repo->findBy([], ['id' => 'DESC']);

        return $this->render('project/index.html.twig', [
            'controller_name' => 'ProjectController',
            'projects' => $projects
        ]);
    }


    public function myProjects(UserInterface $user){

        $id = $user->getId();
        $project_repo = $this->getDoctrine()->getRepository(Project::class);
        $projects = $project_repo->findBy(['creatorUser' => $id ],['id' => 'DESC']);
                
        return $this->render('project/index.html.twig',[
            'projects' => $projects
        ]); 
    }


    public function creation(Request $request, UserInterface $user){

        $project = new Project();
    
        $form = $this->createForm(ProyectType::class, $project);
        
        $form->handleRequest($request);
        
        if($form->isSubmitted() && $form->isValid()){
            
            $project->setCreatedAt(new \Datetime('now'));
            $project->setcreatorUser($user->getId());
        
            $em = $this->getDoctrine()->getManager();
            $em->persist($project);
            $em->flush();
            
            return $this->redirect($this->generateUrl('project_detail', ['id' => $project->getId()]));
        }
        
        return $this->render('project/creation.html.twig',[
            'form' => $form->createView()
        ]);
    }


    public function edit(Request $request, UserInterface $user, Project $project){


        foreach($project as $pro){

           foreach($pro->getTasks() as $task){

               if(!$user || $user->getId() != $task->getUser()->getId() ){
                  return $this->redirectToRoute('projects');
               }
           }
        }

        $form = $this->createForm(ProyectType::class, $project);
        
        $form->handleRequest($request);
        
        if($form->isSubmitted() && $form->isValid()){
        
            $em = $this->getDoctrine()->getManager();
            $em->persist($project);
            $em->flush();
            
            return $this->redirect($this->generateUrl('project_detail',['id' => $project->getId()] ));

        }
        
        return $this->render('project/creation.html.twig',[
            'edit' => true,
            'form' => $form->createView()
        ]);
    }


    public function detail(Project $project,$diagram_project){

        if(!$project){
            return $this->redirectToRoute('projects');
        }else{
            
            $id = $project->getId();
            $connection = $this->getDoctrine()->getConnection();
            $sql="SELECT distinct p.project_name,p.content,p.phase as 'phase_proyecto',p.priority as 'priority_project' ";
            $sql .=" ,t.title,t.content,t.priority as 'priority_task',t.phase as 'phase_task',t.hours FROM clients c ";
            $sql .= " inner join projects p on c.id = p.client_id ";
            $sql .= " inner join tasks t on p.id = t.project_id ";
            $sql .= " inner join users u on u.id = t.user_id ";
            $sql .= " where p.id = $id ";
         
            $prepare = $connection->prepare($sql);
            $prepare->execute();
            $projects = $prepare->fetchAll();

            $sqlpro ="select distinct ta.id,ta.project_id,ta.content,ta.phase from projects pro,tasks ta ";
            $preparepro = $connection->prepare($sqlpro);
            $preparepro->execute();
            $progress = $preparepro->fetchAll();

                if($diagram_project == 'diagrama'){

                    $sql="SELECT distinct t.title,t.phase as 'phase_task' FROM clients c";
                    $sql .= " inner join projects p on c.id = p.client_id ";
                    $sql .= " inner join tasks t on p.id = t.project_id ";
                    $sql .= " inner join users u on u.id = t.user_id ";
                    $sql .= " where p.id = $id ";
         
                    $prepare = $connection->prepare($sql);
                    $prepare->execute();
                    $projects = $prepare->fetchAll();

                    return $this->render('project/diagram.html.twig',[
                        'project' => $project,
                        'projects' => $projects
                    ]);

                }else{

                    return $this->render('project/detail.html.twig',[
                        'project' => $project,
                        'projects' => $projects,
                        'projects_progress' => $progress,
                        'id'=>$id
                    ]);
               }
        }  
          
    }

    public function diagrams(): Response{

        $project_repo = $this->getDoctrine()->getRepository(Project::class);
        $projects = $project_repo->findBy([],['id' => 'DESC']);

        return $this->render('project/index.html.twig', [
            'diagram_project' => true,
            'projects' => $projects
        ]);
    }


}

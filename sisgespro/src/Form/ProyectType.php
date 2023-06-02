<?php
namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use App\Entity\Client;

class ProyectType extends AbstractType{
	
	public function buildForm(FormBuilderInterface $builder, array $options){

		$builder->add('projectName', TextType::class, array(
					  'label' => 'Nombre Proyecto'
					  ))

				->add('content', TextareaType::class, array(
			         	 'label' => 'Contenido'
		              ))

		        ->add('phase', ChoiceType::class, array(
			          'label' => 'Fase',
			          'choices' => array(
				           'Por iniciar' => 'to start',
				           'En progreso' => 'in progress',
				           'Estancado' => 'stagnant',
				           'Finalizado' => 'finished'
			                            )
		              ))

		        ->add('startDate', DateType::class, [
                      		 'label' => 'Fecha Inicio Proyecto',
                      		 'widget' => 'single_text'
                      	     ])

		        ->add('endDate', DateType::class, [
                       		'label' => 'Fecha Fin Proyecto',
                       		'widget' => 'single_text'
                             ])

               	->add('client', EntityType::class, [
                       		'label' => 'Cliente',
                      		'class' => 'App\Entity\Client',
                       		'choice_label' => 'companyName',
                       		'placeholder' => 'Escoger Cliente',
                      	      ])

		         ->add('priority', ChoiceType::class, array(
			           'label' => 'Prioridad',
			           'choices' => array(
				            'Alta' => 'high',
				            'Media' => 'medium',
				            'Baja' => 'low'
			                             )
		               ))

		         ->add('projectBudget', TextType::class, array(
			           'label' => 'Presupuesto Proyecto'
		               ))

		         ->add('submit', SubmitType::class, array(
			           'label' => 'Guardar'
		               ));

	}
	
	
}
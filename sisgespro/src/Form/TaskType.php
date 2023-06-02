<?php
namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use App\Entity\Project;

class TaskType extends AbstractType{
	
	public function buildForm(FormBuilderInterface $builder, array $options){

		$builder->add('title', TextType::class, array(
					  'label' => 'Titulo'
					 ))

				->add('content', TextareaType::class, array(
					  'label' => 'Contenido'
					 ))

         		->add('project', EntityType::class, [
                      'label' => 'Proyecto',
                      'class' => 'App\Entity\Project',
                      'choice_label' => 'projectName',
                      'placeholder' => 'Escoger Proyecto',
                      ])

				->add('priority', ChoiceType::class, array(
					  'label' => 'Prioridad',
					  'choices' => array(
					     'Alta' => 'high',
				         'Media' => 'medium',
				         'Baja' => 'low'
			             )
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

				->add('hours', TextType::class, array(
					  'label' => 'Horas presupuestadas'
		              ))

				->add('submit', SubmitType::class, array(
			          'label' => 'Guardar'
		             ));

	}
	
	
}
<?php
namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\FileType;

class RegisterClientType extends AbstractType{
	
	public function buildForm(FormBuilderInterface $builder, array $options){

		$builder->add('companyName', TextType::class, array(
			'label' => 'Nombre Compañia'
		))

		->add('ntdide', TextType::class, array(
			'label' => 'Numero Identificacion'
		))

		->add('phone', TextType::class, array(
			'label' => 'Numero Telefono'
		))

		->add('contact', TextType::class, array(
			'label' => 'Contacto'
		))

		->add('image', FileType::class, array(
			'data_class' => null,'required' => false,
		'label' => 'Seleccione una Imagen',
			'mapped' => 'false'))
		
		->add('submit', SubmitType::class, array(
			'label' => 'Guardar'
		));
	}
	
}
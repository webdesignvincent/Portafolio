'use strict'

// CARGAR MODULO
var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');

// CARGAR MODELO
var User = require('../models/user');

//CARGAR SERVICIO JWT
var jwt = require('../services/jwt');

// CREAR METODOS DE UserController
var UserController = {

	test: function(req,res){
		return res.status(200).send({message:'Hola Mundo desde el back-end de UserController con Node'});
	},

	save: function(req,res){

		// Recoger los parametros de la peticion
		var params = req.body;

		// Validar los datos
		try{
			var validate_name = !validator.isEmpty(params.name);
			var validate_surname = !validator.isEmpty(params.surname);
			var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
			var validate_password = !validator.isEmpty(params.password);
		}catch(err){
			return res.status(200).send({ mesagge: 'Faltan datos por enviar' });
		}

		if(validate_name && validate_surname && validate_email && validate_password){

			// Creo objeto de usuario
			var user = new User();

			// Asignar valores al objeto
			user.name = params.name;
			user.surname = params.surname;
			user.email = params.email.toLowerCase();
			user.role = 'ROLE_USER';
			user.image = null;

			// Comprobar si el usuario existe
			User.findOne({	email: user.email }, (err, issetUser) => {

				if(err) return res.status(500).send({ message: "Error al comprobar duplicidad de usuario" });

				if(issetUser) return res.status(200).send({ message: "El usuario ya esta registrado" });

				if(!issetUser || issetUser.length == 0){

					// Cifrar contraseña
					bcrypt.hash(params.password, null, null, (err,hash) => {

						user.password = hash;

						  	user.save((err,userStored)=>{

									if(err) return res.status(500).send({mesagge: 'Error en la peticion'});

									if(!userStored || userStored.length == 0) return res.status(404).send({mesagge: 'El usuario no se ha guardado'});
					
									return res.status(200).send({ status: 'success', user: 	userStored });

							});

					});

				}

			});


		}else{
			// Devolver Respuesta
			return res.status(200).send({
				message: "Validación de los datos del usuario incorrecta, intentalo de nuevo"
			});
		}
		
	},

	login: function(req, res){

		// Recoger los parametros de la peticion
		var params = req.body;

		// Asigno email y password
		var email = params.email; 
		var password = params.password;

		// Validar los datos
		try{
			var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
			var validate_password = !validator.isEmpty(params.password);
		}catch(err){
			return res.status(200).send({ mesagge: 'Faltan datos por enviar' });
		}

		// Existe error
		if(!validate_email || !validate_password){
			return res.status(404).send({ mesagge: 'Los datos son incorrectos, envialos bien'} );
		}

		// Buscar usuarios que coincidan con el email
		User.findOne({ email: email.toLowerCase() }, (err,user)=>{

			if(err) return res.status(500).send({mesagge: 'Error en la peticion'});

			if(!user) return res.status(404).send({mesagge: 'El usuario no existe'});

			bcrypt.compare(password, user.password, (err,check)=>{

				if(check){

						if(params.gettoken){
							//Generar Token y devolverlo
							return res.status(200).send({token: jwt.createToken(user)});
						}else{	
							//Deshabilitar campo password
							user.password = undefined;
							//Devolver Datos del Usuario
							return res.status(200).send({
								status: 'success',
								user  :  user
							});
						}
						
				}else{

					return res.status(404).send({ mesagge: 'Las credenciales no son correctas' });
				}

			});


		});

	},

	update: function(req,res){

		// Recoger los parametros de la peticion
		var params = req.body;

		// Recoger el Id del usuario
		var userId = req.user.sub;

		// Validar los datos
		try{
			var validate_name = !validator.isEmpty(params.name);
			var validate_surname = !validator.isEmpty(params.surname);
			var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
		}catch(err){
			return res.status(200).send({ mesagge: 'Faltan datos por enviar' });
		}

		// Eliminar propiedades innecesarias
		delete params.password;

		// Compobrar si el email es unico
		User.find({email: params.email.toLowerCase()}).exec((err,users)=>{

			var user_isset = false; 
			users.forEach((user)=>{
				if(user && user._id != userId) user_isset = true;
			});

			if(user_isset) return res.status(404).send({mesagge:'Los datos ya estan en uso'});

			// Buscar y Actualizar
			User.findOneAndUpdate({ _id:userId }, params, { new:true }, (err, userUpdated)=>{

				if(err) return res.status(500).send({ status:'error', mesagge:'Error al actualizar usuario'});

				if(!userUpdated || userUpdated.length == 0) return res.status(404).send({ status:'error', mesagge:'No se a actualizado el usuario'});

				return res.status(200).send({ status:'success', user:userUpdated});

			});

		});

	},

	uploadAvatar: function(req,res){

		// Recoger el Id del usuario
		var userId = req.user.sub;

		// Nombre del archivo
		var file_name = 'Avatar no subido';

		if(req.file){

		    var file_path = req.file.path;
		 	var file_split = file_path.split('\\'); 
			var file_name = file_split[2];
			var ext_split = file_name.split('\.');
			var file_ext = ext_split[1];

		    if(file_ext.toLowerCase() == 'png' || file_ext.toLowerCase() == 'gif' || file_ext.toLowerCase() == 'jpg' || file_ext.toLowerCase() == 'jpeg'){
			     
			     User.findOneAndUpdate({ _id:userId },{image:file_name},{new:true},(err,userUpdated)=>{

		    		if(err) return res.status(500).send({status: 'error',message: 'Error en la peticion'});

					if(userUpdated.length == 0) return res.status(404).send({status: 'error',mesagge: 'No se ha podido actualizar el usuario'});

		    		return res.status(200).send({
	    				status: 'success',
	    				user: userUpdated
	    			});

		    	});

		    }else{

		    	fs.unlink(file_path, (err)=>{
			     	return res.status(200).send({
			     			status: 'error',
			     			message: 'La extension del archivo no es valida.'
			     	});
			     }); 	

		    }

	  	}else{

	    	res.status(200).send({
	    		status: 'error',
	    		message: 'No has subido ninguna imagen.'
	    	});

	  	}

	},

	avatar: function(req,res){

		var fileName = req.params.fileName;
		var filePath = './uploads/users/'+fileName;

		fs.exists(filePath,(exists)=>{

			if(exists){
				return res.sendFile(path.resolve(filePath));
			}else{
				return res.status(200).send({mesagge:'La imagen no existe'});
			}

		});
	},

	getUsers: function(req,res){

		User.find().exec((err, users)=>{

			if(err || users.length == 0){
				return res.status(404).send({
					status: 'error',
					mesagge: 'No hay usuarios que mostrar'
				});
			}

			return res.status(200).send({
				status: 'success',
				users: users
			});

		});

	},

	getUser: function(req,res){

		var userId = req.params.userId;

		User.findById({ _id:userId }).exec((err, user)=>{

			if(err || user.length == 0){
				return res.status(404).send({
					status: 'error',
					mesagge: 'No existe el usuario'
				});
			}

			return res.status(200).send({
				status: 'success',
				user: user
			});

		});

	} 

};

// EXPORTO MODULO
module.exports = UserController;
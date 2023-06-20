'use strict'

// CARGAR MODULO
var validator = require('validator');

// CARGAR MODELO
var Topic = require('../models/topic');

var CommentController = {

	add: function(req,res){

		// Recoger el id del topic de la url
		var topicId = req.params.topicId;

		// Find por el id del topic
		Topic.findById(topicId).exec((err, topic)=>{
			
			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				});
			}

			if(!topic){
				return res.status(404).send({
					status: 'error',
					message: 'No existe el tema'
				});
			}

			// Comprobar objeto usuario y validar datos
			if(req.body.content){

				// Validar los datos
				try{
					var validate_content= !validator.isEmpty(req.body.content);
				}catch(err){
					return res.status(200).send({ mesagge: 'No has comentado nada' });
				}

				if(validate_content){

					var comment = {
						user: req.user.sub,
						content: req.body.content
					}

					// En la propiedad comments del objeto resultante hacer push
					topic.comments.push(comment);

					topic.save((err)=>{

						if(err){
							return res.status(500).send({
								status: 'error',
								message: 'Error al guardar el comentario'
							});
						}

						// Find por id del topic
						Topic.findById(topic._id)
							 .populate('user')
							 .populate('comments.user')
							 .exec((err, topic)=>{

									if(err) return res.status(500).send({status:'error',message:'error en la peticion'});

									if(!topic || topic.length == 0) return res.status(404).send({status:'error',message:'No existe el tema'});

									return res.status(200).send({
										status: 'success',
										topic:  topic
									});
						});

					});

				}else{
					return res.status(200).send({ mesagge: 'No se han validado los datos del comentario' });
				}

			}

		});

	},

	update: function(req,res){

		// Conseguir id de comentario que llega de la url
		var commentId = req.params.commentId;

		// Recoger datos y validar datos
		var params = req.body;

		try{
			var validate_content= !validator.isEmpty(params.content);
		}catch(err){
			return res.status(200).send({ mesagge: 'No has comentado nada' });
		}

		if(validate_content){

			Topic.findOneAndUpdate(
				{"comments._id" : commentId},
				{ 
					"$set" : {
								"comments.$.content" : params.content
							 }
				},
				{new:true},
				(err, topicUpdated)=>{

					if(err){
						return res.status(500).send({
							status: 'error',
							message: 'Error en la peticion'
						});
					}

					if(!topicUpdated){
						return res.status(404).send({
							status: 'error',
							message: 'No existe el tema'
						});
			        }

					return res.status(200).send({ 
						status: 'success',
						topic: topicUpdated
					});

				}

			);

		}else{
			return res.status(200).send({ mesagge: 'No se han validado los datos del comentario' });
		}

	},

	delete: function(req,res){

		// Conseguir id de comentario y el topic que llega de la url
		var topicId = req.params.topicId;
		var commentId = req.params.commentId;

		Topic.findById(topicId, (err, topic)=>{

			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				});
			}

			if(!topic){
				return res.status(404).send({
					status: 'error',
					message: 'No existe el tema'
				});
			}

			// Seleccionar el subdocumento
			var comment = topic.comments.id(commentId);

			// Borrar el comentario
			if(comment){
				
				comment.remove();

				// Guardar topic
				topic.save((err)=>{

						if(err){
							return res.status(500).send({
								status: 'error',
								message: 'Error en la peticion'
							});
						}

						// Find por id del topic
						Topic.findById(topic._id)
							 .populate('user')
							 .populate('comments.user')
							 .exec((err, topic)=>{

									if(err) return res.status(500).send({status:'error',message:'error en la peticion'});

									if(!topic || topic.length == 0) return res.status(404).send({status:'error',message:'No existe el tema'});

									return res.status(200).send({
										status: 'success',
										topic:  topic
									});
						});

				});
				
			}else{
				return res.status(404).send({
					status: 'error',
					message: 'No existe el comentario'
				});
			}


		});

	}

};

module.exports = CommentController;
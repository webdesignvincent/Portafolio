'use strict'

// CARGAR MODULO
var validator = require('validator');

// CARGAR MODELO
var Topic = require('../models/topic');

var TopicController = {

	test: function(req,res){
		return res.status(200).send({message:'Hola Mundo desde el back-end de TopicController con Node'});
	},

	save: function(req,res){

		// Recoger los parametros de la peticion
		var params = req.body;

		// Validar los datos
		try{
			var validate_title = !validator.isEmpty(params.title);
			var validate_content= !validator.isEmpty(params.content);
			var validate_lang = !validator.isEmpty(params.lang);
		}catch(err){
			return res.status(200).send({ mesagge: 'Faltan datos por enviar' });
		}

		if(validate_title && validate_content && validate_lang){

			// Crear el Objeto
			var topic = new Topic();

			// Asinar valores
			topic.title = params.title;
			topic.content = params.content;
			topic.code = params.code;
			topic.lang = params.lang;
			topic.user = req.user.sub;

			topic.save((err,topicStored)=>{

				if(err || !topicStored || topicStored.length == 0){
				    return res.status(404).send({ 
						status: 'error',
						message: "El tema no se ha guardado" 
				    });

				}

				return res.status(200).send({
					status: 'success',
					topic:  topicStored
				});

			});

		}else{
			return res.status(200).send({message:'Los datos no son validos'});
		}

	},

	getTopics: function(req,res){

		// Recoger pagina actual
		if(req.params.page == "0" || req.params.page == 0 || req.params.page == undefined || !req.params.page){
			var page = 1;
		}else{
			var page = parseInt(req.params.page);
		}

		// Indicar las opciones de paginacion
		var options = {
			sort: { date: -1 },
			populate : 'user',
			limit: 5,
			page: page
		}

		// Find paginado
		Topic.paginate({}, options, (err, topics)=>{

			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error al hacer la consulta'
				});
			}

			if(!topics || topics.length == 0){
				return res.status(404).send({
					status: 'error',
					message: 'No hay topics'
				});
			}

			return res.status(200).send({
				status: 'success',
				topics: topics.docs,
				totalDocs: topics.totalDocs,
				totalPages: topics.totalPages
			});

		});

	},

	getTopicsByUser: function(req,res){

		// Conseguir el id del usuario
		var userId = req.params.user;

		// Find con una condicion de usuario
		Topic.find({user:userId})
			 .sort([['date','descending']])
			 .exec((err, topics)=>{

			 	if(err) return res.status(500).send({status:'error',message:'error en la peticion'});

			 	if(!topics || topics.length == 0) return res.status(404).send({status:'error',message:'No hay temas para mostrar'});

			 	return res.status(200).send({
			 		status: 'success',
			 		topics: topics
			 	});

			 });

	},

	getTopic: function(req,res){

		// Conseguir el id 
		var topicId = req.params.id;

		// Find por id del topic
		Topic.findById(topicId)
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

	},

	update: function(req,res){

		// Recoger el id del topic de la url
		var topicId = req.params.id;

		// Recoger los datos que llegan desde post
		var params = req.body;

		// Validar los datos
		try{
			var validate_title = !validator.isEmpty(params.title);
			var validate_content = !validator.isEmpty(params.content);
			var validate_lang = !validator.isEmpty(params.lang);
		}catch(err){
			return res.status(200).send({ mesagge: 'Faltan datos por enviar' });
		}

		if(validate_title && validate_content && validate_lang){

			// montar un json
			var update = {
				title:   params.title,
				content: params.content,
				code: 	 params.code,
				lang:    params.lang
			}

			// Find and update
			Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, {new:true},(err,topicUpdated)=>{

				if(err){
					return res.status(500).send({
						status: 'error',
						message: 'Error en la peticion' 
					});
				}

				if(!topicUpdated || topicUpdated.length == 0){
					return res.status(404).send({
						status: 'error',
						message: 'No se ha actualizado el tema' 
					});
				} 

				return res.status(200).send({
					status: 'success',
					topic:  topicUpdated
				});
			});

		}else{

			return res.status(200).send({message:'La validacion de los datos no es correcta.'});

		}

	},

	delete: function(req,res){

		// Recoger el id del topic de la url
		var topicId = req.params.id;

		Topic.findOneAndDelete({_id:topicId, user: req.user.sub},(err, topicRemoved)=>{

			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion' 
				});
			}

			if(!topicRemoved || topicRemoved.length == 0){
				return res.status(404).send({
					status: 'error',
					message: 'No se ha borrado el tema' 
				});
			} 

			return res.status(200).send({
					status: 'success',
					topic:  topicRemoved
			});

		});

	},

	search: function(req,res){

		// Sacar el string a buscar de la URL
		var searchString = req.params.search;

		Topic.find({ "$or": [
									{ "title"   : { "$regex" : searchString, 
									                "$options" : "i" 
								                  } 
								    },
									{ "content" : { "$regex" : searchString, 
													"$options" : "i" 
												  } 
								    },
									{ "code"    : { "$regex" : searchString, 
												    "$options" : "i" 
											      } 
									},
									{ "lang"    : { "$regex" : searchString,
												    "$options" : "i" 
											      } 
								    }
				   			]
	              })
		      .populate('user')
			  .sort([['date','descending']])
			  .exec((err, topics)=>{

			  		if(err){
						return res.status(500).send({
							status: 'error',
							message: 'Error en la peticion' 
						});
					}

					if(!topics || topics.length == 0){
						return res.status(404).send({
							status: 'error',
							message: 'No hay temas disponibles con la palabra:' + ' ' + req.params.search
						});
					} 

					return res.status(200).send({
						status: 'success',
						topics:  topics
					});

			  });

	}

};

module.exports = TopicController;
'use strict'

//CARGAR MODULOS
var jwt = require('jwt-simple');
var moment = require('moment');

exports.authenticated = function(req,res,next){

	// Comprobar si llega autorizacion
	if(!req.headers.authorization){
		return res.status(403).send({message: "La peticion no tiene la cabecera de authorizacion"});
	}

	// Limpiar el token
	var token = req.headers.authorization.replace(/['"]+/g,'');

	try{

		// Decodificar token
		var payload = jwt.decode(token,'clave-secreta-para-generar-el-token-9999');

		// Comprobar si el token a expirado
		if(payload.exp <= moment().unix()){
			return res.status(401).send({message: "El token a expirado"});
		}

	}catch(ex){
		return res.status(404).send({message: "El token no es valido"});
	}

	// Adjuntar usuario identificado
	req.user = payload;

	// Pasar a la accion
	next();
};
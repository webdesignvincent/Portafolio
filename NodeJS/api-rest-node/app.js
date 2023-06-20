'use strict'

// CARGAR MODULO
var express = require('express');
var bodyParser = require('body-parser');

// EJECUTO MODULO EXPRESS
var app = express();

// CARGAR ARCHIVO DE RUTAS
var user_routes = require('./routes/user');
var topic_routes = require('./routes/topic');
var comment_routes = require('./routes/comment');

// MIDDLEWARES
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// CORS PERMITE EL ACCESO ENTRE DOMINIOS PARA  EVITAR FALLOS ENTRE EL FRONTEND Y BACKEND
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// REESCRIBIR RUTAS
app.use('/api',user_routes);
app.use('/api',topic_routes);
app.use('/api',comment_routes);

// RUTA DE PRUEBA
app.get('/prueba', (req,res)=>{
	return res.status(200).send({message:'Hola Mundo desde el back-end con Node'});
});

// EXPORTAR MODULO
module.exports = app;
'use strict'

// CARGAR MODULO
const mongoose = require('mongoose');

// CARGAR APP
const app = require('./app');

// ASIGNO PUERTO
const port = process.env.PORT || 3999;

// CONEXION BASE DE DATOS
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/api_rest_node',{ useNewUrlParser: true })
 		.then(()=>{
 			console.log('La conexion a la base de datos de MONGO se ha realizado correctamente!');
 			// CREAR EL SERVIDOR
 			app.listen(port, ()=>{
 				console.log('El servidor http://localhost:3999 esta funcionando!');
 			});
 		})
 		.catch(error => console.log(error));


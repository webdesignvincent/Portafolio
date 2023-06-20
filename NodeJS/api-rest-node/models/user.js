'use strict'

// CARGAR MODULO
var mongoose = require('mongoose');

// CREO VARIABLE ESQUEMA
var Schema = mongoose.Schema;

// DEFINO ESQUEMA
var UserSchema = Schema({
	name: 	  String,
	surname:  String,
	email: 	  String,
	password: String,
	image:    String,
	role:     String
});

// DISABLE PASSWORD
UserSchema.methods.toJSON = function(){
	var obj = this.toObject();
	delete obj.password;
	return obj;
}

// EXPORTO MODULO
module.exports = mongoose.model('User',UserSchema);
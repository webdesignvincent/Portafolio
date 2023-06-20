'use strict'

// CARGAR MODULO
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

// CREO VARIABLE ESQUEMA
var Schema = mongoose.Schema;

// DEFINO ESQUEMA MODELO COMMENT
var CommentSchema = Schema({
	content:  String,
	date:     { type: Date, default: Date.now },
	user:     { type: Schema.ObjectId, ref: 'User' }
});

var Comment = mongoose.model('Comment', CommentSchema);

// DEFINO ESQUEMA MODELO TOPIC
var TopicSchema = Schema({
	title:  String,
	content:String,
	code:   String,
	lang:   String,
	date:   { type: Date, default: Date.now },
	user:   { type: Schema.ObjectId, ref: 'User' },
	comments: [CommentSchema] 
});

// CARGAR PAGINACION
TopicSchema.plugin(mongoosePaginate);

// EXPORTO MODULO
module.exports = mongoose.model('Topic',TopicSchema);

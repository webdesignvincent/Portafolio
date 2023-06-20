'use strict'

// CARGAR MODULO 
var express = require('express');

// EJECUTO MODULO
var router = express.Router();

// CARGO CONTROLADOR
var CommentController = require('../controllers/comment');

// CARGO MIDDLEWARE
var md_auth = require('../middlewares/authenticated');

// CREO RUTAS
router.post('/comment/topic/:topicId', md_auth.authenticated, CommentController.add);
router.put('/comment/:commentId', md_auth.authenticated, CommentController.update);
router.delete('/comment/:topicId/:commentId', md_auth.authenticated, CommentController.delete);

// EXPORTO ROUTER
module.exports = router;
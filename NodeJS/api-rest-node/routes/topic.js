'use strict'

// CARGAR MODULO 
var express = require('express');

// EJECUTO MODULO
var router = express.Router();

// CARGO CONTROLADOR
var TopicController = require('../controllers/topic');

// CARGO MIDDLEWARE
var md_auth = require('../middlewares/authenticated');

// CREO RUTAS
router.get('/test-topic', TopicController.test);
router.post('/topic', md_auth.authenticated, TopicController.save);
router.get('/topics/:page?', TopicController.getTopics);
router.get('/user-topics/:user', TopicController.getTopicsByUser);
router.get('/topic/:id', TopicController.getTopic);
router.put('/topic/:id', md_auth.authenticated, TopicController.update);
router.delete('/topic/:id', md_auth.authenticated, TopicController.delete);
router.get('/search/:search', TopicController.search);

// EXPORTO ROUTER
module.exports = router;
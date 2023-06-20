'use strict'

// CARGAR MODULO 
var express = require('express');

// EJECUTO MODULO
var router = express.Router();

// CARGO CONTROLADOR
var UserController = require('../controllers/user');

// CARGO MIDDLEWARE
var md_auth = require('../middlewares/authenticated');

// CARGAR MODULO Y CONFIGURAR MULTER
const multer = require('multer');

const storage = multer.diskStorage({

           destination: function(req, file, cb) {
              cb(null, './uploads/users');
           },
           filename: function(req, file, cb) {
              cb(null, `${Date.now()}-${file.originalname}`);
           }

});

const mul_upload = multer({ storage: storage });

// CREO RUTAS
router.get('/test-user', UserController.test);
router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/user/update', md_auth.authenticated, UserController.update);
router.post('/upload-avatar', [md_auth.authenticated, mul_upload.single('file0')], UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers);
router.get('/user/:userId', UserController.getUser);

// EXPORTO ROUTER
module.exports = router;
const express = require('express');
const router = express.Router();
const tokenValidatorController = require('../controllers/tokenValidator');

// Ruta para validar tokens
router.post('/validate', tokenValidatorController.validateToken);

module.exports = router;
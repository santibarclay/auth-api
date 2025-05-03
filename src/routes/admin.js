const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/authMiddleware');

// Dashboard del administrador
router.get('/dashboard', ensureAuthenticated, adminController.dashboard);

// Crear un nuevo cliente OAuth2
router.post('/clients', ensureAdmin, adminController.createClient);

// Eliminar un cliente OAuth2
router.delete('/clients/:clientId', ensureAdmin, adminController.deleteClient);

module.exports = router;
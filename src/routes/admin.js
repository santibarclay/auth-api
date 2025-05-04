const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware para asegurar que el usuario esté autenticado
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login');
};

// Middleware para asegurar que el usuario sea un administrador
const ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ error: 'Acceso denegado' });
};

// Dashboard del administrador
router.get('/dashboard', ensureAuthenticated, adminController.dashboard);

// Crear un nuevo cliente OAuth2
router.post('/clients', ensureAdmin, adminController.createClient);

// Actualizar scopes de un cliente
router.put('/clients/:clientId/scopes', ensureAdmin, adminController.updateClientScopes);

// Eliminar un cliente OAuth2
router.delete('/clients/:clientId', ensureAdmin, adminController.deleteClient);

module.exports = router;
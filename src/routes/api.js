const express = require('express');
const router = express.Router();
// Usar la implementación con axios
const { validateToken, requireScope, createContactsApiProxy } = require('../proxy/axiosProxy');
const config = require('../config');

// Rutas de la API de contactos
// GET /api/contacts - Obtener todos los contactos (requiere scope: contacts:read)
router.get('/contacts', 
  validateToken,
  requireScope(config.scopes.contacts.read),
  createContactsApiProxy()
);

// GET /api/contacts/:id - Obtener un contacto específico (requiere scope: contacts:read)
router.get('/contacts/:id', 
  validateToken,
  requireScope(config.scopes.contacts.read),
  createContactsApiProxy()
);

// POST /api/contacts/search - Buscar contactos (requiere scope: contacts:read)
router.post('/contacts/search', 
  validateToken,
  requireScope(config.scopes.contacts.read),
  createContactsApiProxy()
);

// POST /api/contacts - Crear un nuevo contacto (requiere scope: contacts:write)
router.post('/contacts', 
  validateToken,
  requireScope(config.scopes.contacts.write),
  createContactsApiProxy()
);

// PUT /api/contacts/:id - Actualizar un contacto (requiere scope: contacts:write)
router.put('/contacts/:id', 
  validateToken,
  requireScope(config.scopes.contacts.write),
  createContactsApiProxy()
);

// DELETE /api/contacts/:id - Eliminar un contacto (requiere scope: contacts:delete)
router.delete('/contacts/:id', 
  validateToken,
  requireScope(config.scopes.contacts.delete),
  createContactsApiProxy()
);

// Ruta para probar el proxy directamente (solo en desarrollo)
if (config.environment === 'development') {
  router.post('/test-proxy', 
    (req, res) => {
      console.log('Test proxy route hit');
      console.log('Body:', req.body);
      res.json({ success: true, message: 'Test proxy route working', receivedBody: req.body });
    }
  );
}

module.exports = router;
const clientModel = require('../models/client');
const config = require('../config');

/**
 * Renderiza el dashboard del administrador
 */
const dashboard = (req, res) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.redirect('/auth/login');
  }

  const clients = clientModel.getAll();
  const availableScopes = [
    { id: config.scopes.contacts.read, name: 'Lectura de contactos' },
    { id: config.scopes.contacts.write, name: 'Escritura de contactos' },
    { id: config.scopes.contacts.delete, name: 'Eliminación de contactos' }
  ];

  res.render('admin/dashboard', {
    user: req.user,
    clients,
    availableScopes,
    token: req.session.token
  });
};

/**
 * Crea un nuevo cliente OAuth2
 */
const createClient = (req, res) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
// Obtener scopes seleccionados
    let scopes = [];
    if (req.body.scopes && Array.isArray(req.body.scopes)) {
      scopes = req.body.scopes;
    } else if (req.body.scopes) {
      scopes = [req.body.scopes];
    }

    const client = clientModel.create({
      name: req.body.name,
      description: req.body.description,
      scopes
    });

// Retornar cliente con secret (solo se mostrará una vez)
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Actualiza los scopes de un cliente
 */
const updateClientScopes = (req, res) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const clientId = req.params.clientId;

// Obtener scopes seleccionados
  let scopes = [];
  if (req.body.scopes && Array.isArray(req.body.scopes)) {
    scopes = req.body.scopes;
  } else if (req.body.scopes) {
    scopes = [req.body.scopes];
  }

  const updatedClient = clientModel.updateScopes(clientId, scopes);

  if (!updatedClient) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  res.json(updatedClient);
};

/**
 * Elimina un cliente OAuth2
 */
const deleteClient = (req, res) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const deleted = clientModel.remove(req.params.clientId);

  if (!deleted) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  res.status(204).send();
};

module.exports = {
  dashboard,
  createClient,
  updateClientScopes,
  deleteClient
};
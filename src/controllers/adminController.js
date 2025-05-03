
const clientModel = require('../models/client');

/**
 * Renderiza el dashboard del administrador
 */
const dashboard = (req, res) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.redirect('/auth/login');
  }

  const clients = clientModel.getAll();

  res.render('admin/dashboard', {
    user: req.user,
    clients,
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
    const client = clientModel.create({
      name: req.body.name,
      description: req.body.description
    });

// Retornar cliente con secret (solo se mostrará una vez)
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
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
  deleteClient
};
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Maneja la solicitud de token mediante Client Credentials
 */
const tokenRequest = (req, res) => {
// La validación de credenciales se realiza en el middleware de Passport
  if (!req.user) {
    return res.status(401).json({
      error: 'invalid_client',
      error_description: 'Cliente no autorizado'
    });
  }

// Generar un JWT para el cliente
  const payload = {
    sub: req.user.id,
    name: req.user.name,
    role: 'client',
    iss: 'auth-api',
    aud: config.apiDomain
  };

  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });

// Devolver el token en formato OAuth2
  res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: parseInt(config.jwt.expiresIn) || 3600
  });
};

module.exports = {
  tokenRequest
};
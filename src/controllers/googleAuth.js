const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Redirecciona al usuario a Google para autenticación
 */
const googleLogin = (req, res, next) => {
// La lógica se maneja a través del middleware de Passport
  next();
};

/**
 * Maneja la respuesta de Google después de la autenticación
 */
const googleCallback = (req, res) => {
// Si la autenticación falló o el usuario no es administrador
  if (!req.user) {
    return res.redirect('/auth/login?error=unauthorized');
  }

// Generar un JWT para el usuario
  const payload = {
    sub: req.user.id,
    email: req.user.email,
    name: req.user.name,
    role: 'admin',
    iss: 'auth-api',
    aud: config.apiDomain,
// Los administradores tienen todos los scopes
    scopes: [
      config.scopes.contacts.read,
      config.scopes.contacts.write,
      config.scopes.contacts.delete
    ]
  };

  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });

// Almacenar el token en la sesión
  req.session.token = token;

// Redireccionar al panel de administración
  res.redirect('/admin/dashboard');
};

/**
 * Cierra la sesión del usuario
 */
const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    req.session.destroy();
    res.redirect('/');
  });
};

module.exports = {
  googleLogin,
  googleCallback,
  logout
};
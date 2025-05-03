/**
 * Middleware para asegurar que el usuario esté autenticado
 */
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/auth/login');
  };
  
  /**
   * Middleware para asegurar que el usuario sea un administrador
   */
  const ensureAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
    res.status(403).json({ error: 'Acceso denegado' });
  };
  
  module.exports = {
    ensureAuthenticated,
    ensureAdmin
  };
  
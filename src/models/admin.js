const config = require('../config');

/**
 * Verifica si un correo electrónico pertenece a un administrador autorizado
 *@param{string}email - Correo electrónico para verificar
 *@returns{boolean} true si es un administrador autorizado, false en caso contrario
 */
const isAuthorizedAdmin = (email) => {
  if (!email) return false;
  return config.adminEmails.includes(email.toLowerCase());
};

module.exports = {
  isAuthorizedAdmin
};
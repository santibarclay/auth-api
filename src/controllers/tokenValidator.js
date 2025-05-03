const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Valida un token JWT
 */
const validateToken = (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(400).json({
      valid: false,
      error: 'No se proporcionó un token'
    });
  }
  
  // Extraer el token del encabezado
  const [bearer, token] = authHeader.split(' ');
  
  if (bearer !== 'Bearer' || !token) {
    return res.status(400).json({
      valid: false,
      error: 'Formato de token inválido'
    });
  }
  
  try {
    // Verificar el token
    const payload = jwt.verify(token, config.jwt.secret);
    
    // Verificar audiencia
    if (payload.aud !== config.apiDomain) {
      return res.status(403).json({
        valid: false,
        error: 'Audiencia inválida'
      });
    }
    
    return res.json({
      valid: true,
      payload: {
        sub: payload.sub,
        role: payload.role,
        iss: payload.iss
      }
    });
  } catch (error) {
    return res.status(401).json({
      valid: false,
      error: error.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido'
    });
  }
};

module.exports = {
  validateToken
};
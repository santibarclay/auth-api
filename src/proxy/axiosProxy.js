const axios = require('axios');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware para validar tokens antes de proxear las solicitudes
 */
const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: 'Se requiere autorización'
    });
  }
  
  // Extraer el token del encabezado
  const [bearer, token] = authHeader.split(' ');
  
  if (bearer !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'Formato de token inválido'
    });
  }
  
  try {
    // Verificar el token
    const payload = jwt.verify(token, config.jwt.secret);
    
    // Verificar audiencia
    if (payload.aud !== config.apiDomain) {
      return res.status(403).json({
        error: 'Audiencia inválida'
      });
    }
    
    // Agregar información del usuario al request para uso en verificación de scopes
    req.user = {
      sub: payload.sub,
      role: payload.role,
      scopes: payload.scopes || []
    };
    
    // Continuar al siguiente middleware
    next();
  } catch (error) {
    return res.status(401).json({
      error: error.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido'
    });
  }
};

/**
 * Middleware para verificar scopes
 */
const requireScope = (scope) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autorizado'
      });
    }
    
    // Los administradores siempre tienen acceso completo
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Verificar si el token tiene el scope requerido
    if (!req.user.scopes || !req.user.scopes.includes(scope)) {
      return res.status(403).json({
        error: 'Scope insuficiente para esta operación',
        requiredScope: scope
      });
    }
    
    next();
  };
};

/**
 * Crea el middleware de proxy para la API de contactos usando axios
 */
const createContactsApiProxy = () => {
  return async (req, res) => {
    try {
      // Construir la URL correcta para la API
      const newPath = req.url.replace(/^\/api\/contacts/, '/contacts');
      const url = `${config.contactsApiUrl}${newPath}`;
      
      // Copiar los headers relevantes
      const headers = { 
        'Content-Type': req.headers['content-type'] || 'application/json'
      };
      
      // Agregar headers de usuario
      if (req.user) {
        headers['X-User-ID'] = req.user.sub;
        headers['X-User-Role'] = req.user.role;
        if (req.user.scopes) {
          headers['X-User-Scopes'] = req.user.scopes.join(' ');
        }
      }
      
      console.log(`Proxying ${req.method} to ${url}`);
      console.log('Headers:', headers);
      if (req.body) {
        console.log('Body:', JSON.stringify(req.body));
      }
      
      // Realizar la solicitud con axios
      const response = await axios({
        method: req.method,
        url: url,
        headers: headers,
        data: req.method !== 'GET' ? req.body : undefined,
        timeout: 30000
      });
      
      // Devolver la respuesta
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error('Proxy error:', error.message);
      
      // Si hay una respuesta de error del servidor API
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      
      // Si es un error de timeout
      if (error.code === 'ECONNABORTED') {
        return res.status(504).json({
          error: 'Gateway Timeout',
          message: 'La API tardó demasiado en responder'
        });
      }
      
      // Cualquier otro error
      res.status(500).json({
        error: 'Error al comunicarse con la API',
        message: error.message
      });
    }
  };
};

module.exports = {
  validateToken,
  requireScope,
  createContactsApiProxy
};
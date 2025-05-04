const { createProxyMiddleware } = require('http-proxy-middleware');
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
 * Crea el middleware de proxy para la API de contactos
 */
const createContactsApiProxy = () => {
  return createProxyMiddleware({
    target: config.contactsApiUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/contacts': '/contacts' // Reescribir la ruta
    },
    // Configuración explícita para preservar el método HTTP
    onProxyReq: (proxyReq, req, res) => {
      // Debug para verificar que el método se mantiene
      console.log(`Original request method: ${req.method}`);
      console.log(`Proxy request method: ${proxyReq.method}`);
      
      // Verificar el Content-Type para solicitudes POST/PUT
      if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
        console.log('Request body exists:', !!req.body);
        console.log('Content-Type:', req.headers['content-type']);
      }
      
      // Agregar headers adicionales al request proxeado
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.sub);
        proxyReq.setHeader('X-User-Role', req.user.role);
        if (req.user.scopes) {
          proxyReq.setHeader('X-User-Scopes', req.user.scopes.join(' '));
        }
      }
      
      console.log(`Proxying ${req.method} request to ${config.contactsApiUrl}${req.url.replace(/^\/api\/contacts/, '/contacts')}`);
    },
    // Añadir logs para la respuesta también
    onProxyRes: (proxyRes, req, res) => {
      console.log(`Received ${proxyRes.statusCode} response from API for ${req.method} request`);
    },
    // Manejar errores del proxy
    onError: (err, req, res) => {
      console.error('Error de proxy:', err);
      
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Error al comunicarse con la API',
          details: err.message
        });
      }
    },
    // Configuraciones adicionales
    secure: false, // No verificar certificados SSL
    followRedirects: true, // Seguir redirecciones
    selfHandleResponse: false, // Dejar que el proxy maneje la respuesta
    timeout: 30000,
    proxyTimeout: 30000
  });
};

module.exports = {
  validateToken,
  requireScope,
  createContactsApiProxy
};
// Cargar variables de entorno
require('dotenv').config();

// Verificar que las variables de entorno se estén cargando
console.log('Variables de entorno cargadas:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);

module.exports = {
  port: process.env.PORT || 9000,
  environment: process.env.NODE_ENV || 'development',

// Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  },

// Configuración de Google OAuth
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:9000/auth/google/callback'
  },

// Configuración de sesiones
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000// 24 horas
    }
  },

// Dominio para el que se emitirán los tokens
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8081',

// Lista de administradores autorizados (correos electrónicos)
  adminEmails: (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim())
};
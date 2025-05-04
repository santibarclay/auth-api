// Cargar variables de entorno
require('dotenv').config();

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
  apiDomain: process.env.API_DOMAIN || 'http://localhost:9000',

// URL de la API de contactos
  contactsApiUrl: process.env.CONTACTS_API_URL || 'http://localhost:8081',

// Lista de administradores autorizados (correos electrónicos)
  adminEmails: (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim()),

// Definición de scopes disponibles
  scopes: {
    contacts: {
      read: 'contacts:read',
      write: 'contacts:write',
      delete: 'contacts:delete'
    }
  }
};
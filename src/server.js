const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const expressLayouts = require('express-ejs-layouts');
const config = require('./config');

// Crear la aplicación Express
const app = express();

// Configurar motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware básico - configuración mejorada para manejar correctamente las solicitudes
// IMPORTANTE: Estos middlewares deben estar ANTES de las rutas
app.use(express.json({ 
  limit: '10mb',
  strict: false // Más permisivo con JSON malformado
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb'
}));
app.use(morgan('dev')); // Usar 'dev' para logs más detallados en desarrollo
app.use(cors({
  origin: '*', // Permitir todas las orígenes para pruebas
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de depuración para ver todas las solicitudes
if (config.environment === 'development') {
  app.use((req, res, next) => {
    console.log('=== Request Debug ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    console.log('=== End Request Debug ===');
    next();
  });
}

// Configurar sesiones
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: config.session.cookie
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar estrategias de autenticación
require('./config/passport');

// Importar rutas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

// Registrar rutas
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error('Error en la aplicación:', err);
  
  // Evitar enviar múltiples respuestas
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
    ...(config.environment === 'development' ? { stack: err.stack } : {})
  });
});

// Iniciar el servidor
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`✅ Servidor de autorización ejecutándose en http://localhost:${PORT}`);
  console.log(`   Entorno: ${config.environment}`);
  console.log(`   Gateway para API de contactos: ${config.contactsApiUrl}`);
});

module.exports = app;
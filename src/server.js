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
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);
app.set('layout', 'layout');

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sesiones
app.use(session(config.session));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar estrategias de autenticación
require('./config/passport');

// Importar rutas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const tokenRoutes = require('./routes/token');

// Registrar rutas
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/token', tokenRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

// Iniciar el servidor
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`✅ Servidor de autorización ejecutándose en http://localhost:${PORT}`);
  console.log(`   Entorno: ${config.environment}`);
});

module.exports = app;
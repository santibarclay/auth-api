const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const config = require('./index');
const adminModel = require('../models/admin');
const clientModel = require('../models/client');

// Serializar usuario para la sesión
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserializar usuario desde la sesión
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Estrategia Google OAuth2
passport.use(new GoogleStrategy(
  {
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL,
    scope: ['profile', 'email']
  },
  (accessToken, refreshToken, profile, done) => {
// Verificar si el correo electrónico está en la lista de administradores
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
    const isAdmin = adminModel.isAuthorizedAdmin(email);

    if (!isAdmin) {
      return done(null, false, { message: 'No autorizado como administrador' });
    }

// Si es un administrador autorizado, crear objeto de usuario
    const user = {
      id: profile.id,
      email: email,
      name: profile.displayName,
      isAdmin: true
    };

    return done(null, user);
  }
));

// Estrategia Client Password para Client Credentials
passport.use(new ClientPasswordStrategy(
  (clientId, clientSecret, done) => {
// Validar credenciales del cliente
    const isValid = clientModel.validateCredentials(clientId, clientSecret);

    if (!isValid) {
      return done(null, false);
    }

    const client = clientModel.findById(clientId);
    return done(null, client);
  }
));

module.exports = passport;
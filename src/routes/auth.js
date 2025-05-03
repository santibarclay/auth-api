const express = require('express');
const passport = require('passport');
const router = express.Router();
const googleAuthController = require('../controllers/googleAuth');
const clientAuthController = require('../controllers/clientAuth');

// Página de login
router.get('/login', (req, res) => {
  res.render('auth/login', { error: req.query.error });
});

// Rutas para Google OAuth
router.get(
  '/google',
  googleAuthController.googleLogin,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login?error=google' }),
  googleAuthController.googleCallback
);

// Ruta para cerrar sesión
router.get('/logout', googleAuthController.logout);

// Ruta para solicitud de token con Client Credentials
router.post(
  '/token',
  passport.authenticate('oauth2-client-password', { session: false }),
  clientAuthController.tokenRequest
);

module.exports = router;
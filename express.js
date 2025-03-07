// index.js
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import { KickAuthClient } from 'kick-auth';
//import { createclient } from './index.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración del middleware de sesión
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Inicializa el cliente de Kick Auth
const kickAuth = new KickAuthClient({
  clientId: process.env.KICK_CLIENT_ID,
  clientSecret: process.env.KICK_CLIENT_SECRET,
  redirectUri: process.env.KICK_REDIRECT_URI,
  scopes: ['user:read', 'channel:read',"events:subscribe","channel:write","chat:write"] // Puedes agregar o quitar scopes según tus necesidades
});
app.post('/webhook', (req, res) => {
  console.log('Evento recibido:', req.body);
  res.sendStatus(200);
});
// Ruta para iniciar el flujo de autenticación (login)
app.get('/auth/login', async (req, res) => {
  try {
    // Obtiene la URL de autorización, estado y código verificador (PKCE)
    const { url, state, codeVerifier } = await kickAuth.getAuthorizationUrl();

    // Guarda el state y el codeVerifier en la sesión
    req.session.state = state;
    req.session.codeVerifier = codeVerifier;

    // Redirige al usuario a la página de login de Kick.com
    res.redirect(url);
  } catch (error) {
    console.error('Error iniciando el flujo de autenticación:', error);
    res.status(500).send('Error iniciando el flujo de autenticación');
  }
});

// Ruta de callback (redirección tras autenticarse en Kick.com)
app.get('/auth/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    // Verifica que el parámetro "state" coincida con el almacenado en la sesión
    if (state !== req.session.state) {
      return res.status(400).send('Parámetro state inválido');
    }

    // Intercambia el código por los tokens de acceso y refresco
    const tokens = await kickAuth.getAccessToken(
      code.toString(),
      req.session.codeVerifier
    );

    // Almacena los tokens en la sesión (asegúrate de almacenarlos de forma segura en producción)
    req.session.accessToken = tokens.access_token;
    req.session.refreshToken = tokens.refresh_token;

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error en callback:', error);
    res.status(500).send('Fallo en la autenticación');
  }
});

// Ruta protegida: Dashboard (acceso solo para usuarios autenticados)
app.get('/dashboard', (req, res) => {
  if (!req.session.accessToken) {
    return res.redirect('/auth/login');
  }
  res.send('¡Bienvenido al Dashboard! Estás autenticado.');
});

// Ruta para cerrar sesión
app.get('/auth/logout', async (req, res) => {
  try {
    // Si existe un token de acceso, revoca el token
    if (req.session.accessToken) {
      await kickAuth.revokeToken(req.session.accessToken);
    }
    // Destruye la sesión y redirige a la página principal
    req.session.destroy(() => {
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).send('Error al cerrar sesión');
  }
});
app.get('/api/token', (req, res) => {
    if (!req.session.accessToken) {
      return res.status(401).json({ error: 'No hay token de acceso disponible. Por favor, inicia sesión.' });
    }
    res.json({ accessToken: req.session.accessToken });
  });
/* app.get('/api/bot', (req, res) => {
    if (!req.session.accessToken) {
      return res.status(401).json({ error: 'No hay token de acceso disponible. Por favor, inicia sesión.' });
    }
    const token = req.session.accessToken;
    createclient(token);
    res.json({ accessToken: req.session.accessToken });
  }); */
// Ruta pública para la página de inicio
app.use(express.static('public'));

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

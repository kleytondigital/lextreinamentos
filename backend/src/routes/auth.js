const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/auth');

// Debug middleware
router.use((req, res, next) => {
    console.log('Auth route accessed:', {
        method: req.method,
        path: req.path,
        fullUrl: req.originalUrl,
        body: req.body
    });
    next();
});

// Rotas públicas
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// Rotas protegidas
router.get('/me', authMiddleware, AuthController.me);

module.exports = router;
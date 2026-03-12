import { Router } from 'express';
import passport from 'passport';
import { generateToken, isTokenExpiringSoon, getTokenTimeLeft  } from '../utils/jwt.util.js';
import { UserDTO, UserTokenDTO } from '../dto/user.dto.js';
import { authenticateCurrent } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', (req, res, next) => {
    passport.authenticate('register', { session: false }, async (err, user, info) => {
        if (err) {
            return res.status(500).json({ 
                status: 'error',
                error: 'Error en el registro',
                details: err.message 
            });
        }

        if (!user) {
            return res.status(400).json({ 
                status: 'error',
                error: info?.message || 'Error al registrar usuario' 
            });
        }

        try {
            const tokenPayload = new UserTokenDTO(user);
            const token = generateToken(tokenPayload);

            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 24 horas
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            const userDTO = new UserDTO(user);
            
            res.status(201).json({
                status: 'success',
                message: 'Usuario registrado exitosamente',
                user: userDTO,
                token
            });
        } catch (error) {
            res.status(500).json({ 
                status: 'error',
                error: 'Error al generar token',
                details: error.message 
            });
        }
    })(req, res, next);
});

router.post('/login', (req, res, next) => {
    passport.authenticate('login', { session: false }, async (err, user, info) => {
        if (err) {
            return res.status(500).json({ 
                status: 'error',
                error: 'Error en el login',
                details: err.message 
            });
        }

        if (!user) {
            return res.status(401).json({ 
                status: 'error',
                error: info?.message || 'Credenciales inválidas' 
            });
        }

        try {
            const tokenPayload = new UserTokenDTO(user);
            const token = generateToken(tokenPayload);

            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 24 horas
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            const userDTO = new UserDTO(user);
            
            res.json({
                status: 'success',
                message: 'Login exitoso',
                user: userDTO,
                token
            });
        } catch (error) {
            res.status(500).json({ 
                status: 'error',
                error: 'Error al generar token',
                details: error.message 
            });
        }
    })(req, res, next);
});

router.get('/current', authenticateCurrent, async (req, res) => {
    try {
        const userDTO = new UserDTO(req.user);
        
        res.json({
            status: 'success',
            user: userDTO
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al obtener usuario actual',
            details: error.message 
        });
    }
});

router.post('/logout', (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({
            status: 'success',
            message: 'Sesión cerrada exitosamente'
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al cerrar sesión',
            details: error.message 
        });
    }
});

router.get('/validate', authenticateCurrent, (req, res) => {
    res.json({
        status: 'success',
        message: 'Token válido',
        valid: true,
        user: new UserDTO(req.user)
    });
});

router.post('/refresh', authenticateCurrent, async (req, res) => {
    try {
        const token = req.cookies.token;

        const expiringSoon = isTokenExpiringSoon(token);
        const timeLeft = getTokenTimeLeft(token);

        const tokenPayload = new UserTokenDTO(req.user);
        const newToken = generateToken(tokenPayload);

        res.cookie('token', newToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });res.json({
            status: 'success',
            message: 'Token renovado exitosamente',
            wasExpiringSoon: expiringSoon,
            previousTimeLeft: `${timeLeft} segundos`,
            token: newToken
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al renovar token',
            details: error.message 
        });
    }
});

export default router;
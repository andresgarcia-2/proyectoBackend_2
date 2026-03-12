import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

export const generateToken = (payload) => {
    try {
        const cleanPayload = {
            id: payload.id?.toString() || payload._id?.toString(),
            email: payload.email,
            role: payload.role,
            cart: payload.cart?.toString() || null
        };
        
        return jwt.sign(cleanPayload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });
    } catch (error) {
        console.error('❌ Error al generar token:', error);
        throw new Error('Error al generar el token JWT');
    }
};

export const generateRefreshToken = (payload) => {
    try {
        const cleanPayload = {
            id: payload.id?.toString() || payload._id?.toString(),
            email: payload.email
        };

        return jwt.sign(cleanPayload, JWT_SECRET, {
            expiresIn: JWT_REFRESH_EXPIRES_IN
        });
    } catch (error) {
        throw new Error('Error al generar el refresh token');
    }
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expirado');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Token inválido');
        }
        throw new Error('Error al verificar el token');
    }
};

export const isTokenExpiringSoon = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return false;
        
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = decoded.exp - now;
        
        return timeLeft < 3600;
    } catch {
        return false;
    }
};

export const getTokenTimeLeft = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return 0;
        
        const now = Math.floor(Date.now() / 1000);
        return Math.max(0, decoded.exp - now);
    } catch {
        return 0;
    }
};

export const extractToken = (req) => {
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    
    return null;
};
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET no está definido');
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

/**
 * Genera un token JWT
 * @param {Object} payload
 * @returns {string}
*/
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

/** 
 * Verifica y decodifica un token JWT 
 * @param {string} token
 * @returns {Object}
*/
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

/** 
 * Extrae el token de las cookies o headers
 * @param {Object}
 * @returns {string|null}
*/

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
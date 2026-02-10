import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * @param {Object} payload
 * @returns {string}
*/
export const generateToken = (payload) => {
    try {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });
    } catch (error) {
        throw new Error('Error al generar el token JWT');
    }
};

/** 
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
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import UserModel from '../models/user.model.js';
import CartModel from '../models/cart.model.js';
import { createHash, isValidPassword } from '../utils/password.util.js';
import { extractToken } from '../utils/jwt.util.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

passport.use('register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        const { first_name, last_name, age, role } = req.body;

        if (!first_name || !last_name || !age) {
            return done(null, false, { 
                message: 'Todos los campos son requeridos' 
            });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return done(null, false, { 
                message: 'El email ya está registrado' 
            });
        }

        const newCart = await CartModel.create({ products: [] });

        const hashedPassword = createHash(password);

        const newUser = await UserModel.create({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword,
            cart: newCart._id,
            role: role || 'user'
        });

        return done(null, newUser);
    } catch (error) {
        return done(error);
    }
}));

passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {

        const user = await UserModel.findOne({ email });

        if (!user) {
            return done(null, false, { 
                message: 'Credenciales inválidas' 
            });
        } 

        if (!user.isActive) {
            return done(null, false, { 
                message: 'Usuario inactivo' 
            });
        }

        if (!isValidPassword(password, user.password)) {
            return done(null, false, { 
                message: 'Credenciales inválidas' 
            });
        }

        user.lastLogin = new Date();
        await user.save();

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

const cookieExtractor = (req) => {
    return extractToken(req);
};

passport.use('current', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: JWT_SECRET
}, async (jwtPayload, done) => {
    try {

        const user = await UserModel.findById(jwtPayload.id)
            .populate('cart')
            .select('-password');

        if (!user) {
            return done(null, false, { 
                message: 'Usuario no encontrado' 
            });
        }

        if (!user.isActive) {
            return done(null, false, { 
                message: 'Usuario inactivo' 
            });
        }

        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));  

passport.use('jwt', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: JWT_SECRET
}, async (jwtPayload, done) => {
    try {
        const user = await UserModel.findById(jwtPayload.id)
            .select('-password');

        if (!user || !user.isActive) {
            return done(null, false);
        }

        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));

export default passport;
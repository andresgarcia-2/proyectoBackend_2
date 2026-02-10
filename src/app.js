import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/database.js';
import passport from './config/passport.config.js';

import sessionsRouter from './routes/sessions.router.js';
import usersRouter from './routes/users.router.js';
import cartsRouter from './routes/carts.router.js';
import productsRouter from './routes/products.router.js';

const app = express();
const PORT = process.env.PORT || 8080;

console.log('🔍 Verificando variables de entorno...');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Definida' : '❌ No definida');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Definida' : '❌ No definida');

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/products', productsRouter);

app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'API E-commerce funcionando correctamente',
        endpoints: {
            sessions: '/api/sessions',
            users: '/api/users',
            carts: '/api/carts',
            products: '/api/products'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        error: 'Ruta no encontrada',
        path: req.path
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        status: 'error',
        error: err.message || 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
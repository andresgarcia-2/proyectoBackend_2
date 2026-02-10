import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB - Database: ecommerce');
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

mongoose.connection.on('connected', () => {
    console.log('📊 Mongoose conectado');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Error en Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('📴 Mongoose desconectado');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
});

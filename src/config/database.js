import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        
        if (!mongoUri) {
            throw new Error('MONGO_URI no está definida en las variables de entorno');
        }

        await mongoose.connect(mongoUri);
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
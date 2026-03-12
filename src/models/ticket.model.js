import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        default: () => uuidv4()
    },
    purchase_datetime: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: [true, 'El monto es requerido'],
        min: [0, 'El monto no puede ser negativo']
    },
    purchaser: {
        type: String,
        required: [true, 'El email del comprador es requerido']
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    status: {
        type: String,
        enum: ['completed', 'partial', 'failed'],
        default: 'completed'
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model('Ticket', ticketSchema);
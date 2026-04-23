import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    specie: {
        type: String,
        required: [true, 'La especie es requerida'],
        enum: ['dog', 'cat', 'rabbit', 'bird', 'hamster']
    },
    birthDate: {
        type: Date
    },
    adopted: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    image: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model('Pet', petSchema);
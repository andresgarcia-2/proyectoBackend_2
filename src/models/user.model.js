import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    last_name: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    age: {
        type: Number,
        required: [true, 'La edad es requerida'],
        min: [18, 'Debes ser mayor de 18 años']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida']
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'premium'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true,
    versionKey: false
});

userSchema.index({ email: 1 }, { unique: true });

userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

export default mongoose.model('User', userSchema);
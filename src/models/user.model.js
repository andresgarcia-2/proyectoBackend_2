import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
    },
    last_name: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true,
        minlength: [2, 'El apellido debe tener al menos 2 caracteres'],
        maxlength: [50, 'El apellido no puede exceder 50 caracteres'],
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Por favor ingrese un email válido']
    },
    age: {
        type: Number,
        required: [true, 'La edad es requerida'],
        min: [18, 'Debes ser mayor de 18 años'],
        max: [120, 'Edad no válida']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin', 'premium'],
            message: 'El rol {VALUE} no es válido'
        },
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
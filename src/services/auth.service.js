import crypto from 'crypto';
import userRepository from '../repositories/user.repository.js';
import mailService from './mail.service.js';
import { isValidPassword } from '../utils/password.util.js';

export class AuthService {
    async requestPasswordReset(email) {
        const user = await userRepository.getByEmail(email);
        if (!user) {
            return { message: 'Si el email existe, recibirás un correo.' };
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await userRepository.savePasswordResetToken(email, token, expiry);
        await mailService.sendPasswordResetEmail(email, token);

        return { message: 'Si el email existe, recibirás un correo.' };
    }

    async resetPassword(token, newPassword) {
        const user = await userRepository.findByResetToken(token);
        if (!user) {
            throw new Error('Token inválido o expirado');
        }

        const isSamePassword = isValidPassword(newPassword, user.password);
        if (isSamePassword) {
            throw new Error('La nueva contraseña no puede ser igual a la anterior');
        }

        await userRepository.resetPassword(user._id, newPassword);
        return { message: 'Contraseña restablecida correctamente' };
    }
}

export default new AuthService();
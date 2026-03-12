import userDAO from '../dao/user.dao.js';
import { UserDTO, UserPublicDTO } from '../dto/user.dto.js';
import { createHash, isValidPassword } from '../utils/password.util.js';

export class UserRepository {
    async getAll() {
        const users = await userDAO.findAll();
        return users.map(user => new UserPublicDTO(user));
    }

    async getById(id) {
        const user = await userDAO.findById(id);
        if (!user) return null;
        return new UserDTO(user);
    }

    async getByEmail(email) {
        return await userDAO.findByEmail(email);
    }

    async create(userData) {
        const hashedPassword = createHash(userData.password);
        const newUser = await userDAO.create({
            ...userData,
            password: hashedPassword
        });
        return new UserDTO(newUser);
    }

    async update(id, updateData) {
        if (updateData.password) {
            updateData.password = createHash(updateData.password);
        }
        const user = await userDAO.update(id, updateData);
        if (!user) return null;
        return new UserDTO(user);
    }

    async delete(id) {
        return await userDAO.delete(id);
    }

    async validatePassword(plainPassword, hashedPassword) {
        return isValidPassword(plainPassword, hashedPassword);
    }

    async savePasswordResetToken(email, token, expiry) {
        return await userDAO.savePasswordResetToken(email, token, expiry);
    }

    async findByResetToken(token) {
        return await userDAO.findByResetToken(token);
    }

    async resetPassword(userId, newPassword) {
        const hashedPassword = createHash(newPassword);
        await userDAO.update(userId, { password: hashedPassword });
        await userDAO.clearResetToken(userId);
    }
}

export default new UserRepository();
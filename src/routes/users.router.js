import { Router } from 'express';
import UserModel from '../models/user.model.js';
import { createHash, isValidPassword } from '../utils/password.util.js';
import { authenticateJWT, isAdmin, authorize } from '../middlewares/auth.middleware.js';
import { UserDTO } from '../dto/user.dto.js';

const router = Router();

router.get('/', authenticateJWT, isAdmin, async (req, res) => {
    try {
        const { limit = 10, page = 1, role, isActive } = req.query;

        const filters = {};
        if (role) filters.role = role;
        if (isActive !== undefined) filters.isActive = isActive === 'true';

        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            select: '-password',
            populate: 'cart',
            sort: { createdAt: -1 }
        };

        const users = await UserModel.paginate(filters, options);

        res.json({
            status: 'success',
            payload: users.docs.map(user => new UserDTO(user)),
            totalPages: users.totalPages,
            prevPage: users.prevPage,
            nextPage: users.nextPage,
            page: users.page,
            hasPrevPage: users.hasPrevPage,
            hasNextPage: users.hasNextPage
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al obtener usuarios',
            details: error.message 
        });
    }
});

router.get('/:uid', authenticateJWT, async (req, res) => {
    try {
        const { uid } = req.params;

        if (req.user.role !== 'admin' && req.user._id.toString() !== uid) {
            return res.status(403).json({ 
                status: 'error',
                error: 'No tienes permiso para ver este perfil' 
            });
        }

        const user = await UserModel.findById(uid)
            .select('-password')
            .populate('cart');

        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Usuario no encontrado' 
            });
        }

        res.json({
            status: 'success',
            user: new UserDTO(user)
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al obtener usuario',
            details: error.message 
        });
    }
});

router.put('/:uid', authenticateJWT, async (req, res) => {
    try {
        const { uid } = req.params;
        const { first_name, last_name, age, email, password, role } = req.body;

         if (req.user.role !== 'admin' && req.user._id.toString() !== uid) {
            return res.status(403).json({ 
                status: 'error',
                error: 'No tienes permiso para actualizar este perfil' 
            });
        }

        const user = await UserModel.findById(uid);

        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Usuario no encontrado' 
            });
        }

        const updateData = {};
        if (first_name) updateData.first_name = first_name;
        if (last_name) updateData.last_name = last_name;
        if (age) updateData.age = age;

        if (req.user.role === 'admin') {
            if (email) updateData.email = email;
            if (role) updateData.role = role;
        }

        if (password) {
            updateData.password = createHash(password);
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            uid,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            status: 'success',
            message: 'Usuario actualizado exitosamente',
            user: new UserDTO(updatedUser)
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al actualizar usuario',
            details: error.message 
        });
    }
});

router.delete('/:uid', authenticateJWT, authorize('admin'), async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await UserModel.findById(uid);

        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Usuario no encontrado' 
            });
        }

        user.isActive = false;
        await user.save();

        res.json({
            status: 'success',
            message: 'Usuario desactivado exitosamente'
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al eliminar usuario',
            details: error.message 
        });
    }
});

router.put('/:uid/change-password', authenticateJWT, async (req, res) => {
    try {
        const { uid } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (req.user._id.toString() !== uid) {
            return res.status(403).json({ 
                status: 'error',
                error: 'No tienes permiso para cambiar esta contraseña' 
            });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                status: 'error',
                error: 'Se requieren la contraseña actual y la nueva' 
            });
        }

        const user = await UserModel.findById(uid);

        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Usuario no encontrado' 
            });
        }

        if (!isValidPassword(currentPassword, user.password)) {
            return res.status(401).json({ 
                status: 'error',
                error: 'Contraseña actual incorrecta' 
            });
        }

        user.password = createHash(newPassword);
        await user.save();

        res.json({
            status: 'success',
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al cambiar contraseña',
            details: error.message 
        });
    }
});

router.put('/:uid/premium', authenticateJWT, authorize('admin'), async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await UserModel.findById(uid);

        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Usuario no encontrado' 
            });
        }

        user.role = user.role === 'user' ? 'premium' : 'user';
        await user.save();

        res.json({
            status: 'success',
            message: `Usuario actualizado a rol ${user.role}`,
            user: new UserDTO(user)
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al actualizar rol',
            details: error.message 
        });
    }
});

export default router;
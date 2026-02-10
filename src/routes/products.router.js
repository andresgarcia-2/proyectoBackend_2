import { Router } from 'express';
import ProductModel from '../models/product.model.js';
import { authenticateJWT, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        const filters = {};
        if (query) {
            filters.$or = [
                { title: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ];
        }

        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {}
        };

        const products = await ProductModel.paginate(filters, options);

        res.json({
            status: 'success',
            payload: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al obtener productos',
            details: error.message 
        });
    }
});

router.post('/', authenticateJWT, authorize('admin', 'premium'), async (req, res) => {
    try {
        const productData = {
            ...req.body,
            owner: req.user.role === 'premium' ? req.user._id : 'admin'
        };

        const newProduct = await ProductModel.create(productData);

        res.status(201).json({
            status: 'success',
            message: 'Producto creado exitosamente',
            product: newProduct
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al crear producto',
            details: error.message 
        });
    }
});

router.put('/:pid', authenticateJWT, authorize('admin', 'premium'), async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await ProductModel.findById(pid);

        if (!product) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Producto no encontrado' 
            });
        }

         if (req.user.role === 'premium' && product.owner?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                status: 'error',
                error: 'No tienes permiso para editar este producto' 
            });
        }

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            pid,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            status: 'success',
            message: 'Producto actualizado',
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al actualizar producto',
            details: error.message 
        });
    }
});

router.delete('/:pid', authenticateJWT, authorize('admin', 'premium'), async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await ProductModel.findById(pid);

        if (!product) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Producto no encontrado' 
            });
        }

        if (req.user.role === 'premium' && product.owner?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                status: 'error',
                error: 'No tienes permiso para eliminar este producto' 
            });
        }

        await ProductModel.findByIdAndDelete(pid);

        res.json({
            status: 'success',
            message: 'Producto eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al eliminar producto',
            details: error.message 
        });
    }
});

export default router;


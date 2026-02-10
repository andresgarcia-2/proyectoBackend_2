import { Router } from 'express';
import CartModel from '../models/cart.model.js';
import ProductModel from '../models/product.model.js';
import { authenticateJWT, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', async (req, res) => {
    try {
        const newCart = await CartModel.create({ products: [] });

        res.status(201).json({
            status: 'success',
            message: 'Carrito creado exitosamente',
            cart: newCart
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al crear carrito',
            details: error.message 
        });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        const cart = await CartModel.findById(cid)
            .populate('products.product');

        if (!cart) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Carrito no encontrado' 
            });
        }

        res.json({
            status: 'success',
            cart
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al obtener carrito',
            details: error.message 
        });
    }
});

router.post('/:cid/product/:pid', authenticateJWT, async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity = 1 } = req.body;

        if (req.user.cart.toString() !== cid && req.user.role !== 'admin') {
            return res.status(403).json({ 
                status: 'error',
                error: 'No tienes permiso para modificar este carrito' 
            });
        }

        const product = await ProductModel.findById(pid);
        if (!product) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Producto no encontrado' 
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ 
                status: 'error',
                error: 'Stock insuficiente',
                available: product.stock 
            });

        }if (req.user.role === 'premium' && product.owner?.toString() === req.user._id.toString()) {
            return res.status(403).json({ 
                status: 'error',
                error: 'No puedes agregar tus propios productos al carrito' 
            });
        }

        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Carrito no encontrado' 
            });
        }

        const existingProductIndex = cart.products.findIndex(
            item => item.product.toString() === pid
        );

        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += parseInt(quantity);
        } else {
            cart.products.push({
                product: pid,
                quantity: parseInt(quantity)
            });
        }

        await cart.save();
        await cart.populate('products.product');

        res.json({
            status: 'success',
            message: 'Producto agregado al carrito',
            cart
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al agregar producto al carrito',
            details: error.message 
        });
    }
});

router.put('/:cid/products/:pid', authenticateJWT, async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (req.user.cart.toString() !== cid && req.user.role !== 'admin') {
            return res.status(403).json({ 
                status: 'error',
                error: 'No tienes permiso para modificar este carrito' 
            });
        }

        if (!quantity || quantity < 1) {
            return res.status(400).json({ 
                status: 'error',
                error: 'La cantidad debe ser mayor a 0' 
            });
        }

        const product = await ProductModel.findById(pid);
        if (!product) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Producto no encontrado' 
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ 
                status: 'error',
                error: 'Stock insuficiente',
                available: product.stock 
            });
        }

        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Carrito no encontrado' 
            });
        }

        const productIndex = cart.products.findIndex(
            item => item.product.toString() === pid
        );

        if (productIndex === -1) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Producto no encontrado en el carrito' 
            });
        }

        cart.products[productIndex].quantity = parseInt(quantity);
        await cart.save();
        await cart.populate('products.product');

        res.json({
            status: 'success',
            message: 'Cantidad actualizada',
            cart
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al actualizar cantidad',
            details: error.message 
        });
    }
});

router.delete('/:cid/products/:pid', authenticateJWT, async (req, res) => {
    try {
        const { cid, pid } = req.params;
        if (req.user.cart.toString() !== cid && req.user.role !== 'admin') {
            return res.status(403).json({ 
                status: 'error',
                error: 'No tienes permiso para modificar este carrito' 
            });
        }

        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Carrito no encontrado' 
            });
        }

        cart.products = cart.products.filter(
            item => item.product.toString() !== pid
        );

        await cart.save();
        await cart.populate('products.product');

        res.json({
            status: 'success',
            message: 'Producto eliminado del carrito',
            cart
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al eliminar producto del carrito',
            details: error.message 
        });
    }
});

router.delete('/:cid', authenticateJWT, async (req, res) => {
    try {
        const { cid } = req.params;

        if (req.user.cart.toString() !== cid && req.user.role !== 'admin') {
            return res.status(403).json({ 
                status: 'error',
                error: 'No tienes permiso para modificar este carrito' 
            });
        }

        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Carrito no encontrado' 
            });
        }

        cart.products = [];
        await cart.save();

        res.json({
            status: 'success',
            message: 'Carrito vaciado exitosamente',
            cart
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al vaciar carrito',
            details: error.message 
        });
    }
});

router.put('/:cid', authenticateJWT, async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        if (req.user.cart.toString() !== cid && req.user.role !== 'admin') {
            return res.status(403).json({ 
                status: 'error',
                error: 'No tienes permiso para modificar este carrito' 
            });
        }

        const cart = await CartModel.findByIdAndUpdate(
            cid,
            { products },
            { new: true }
        ).populate('products.product');

        if (!cart) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Carrito no encontrado' 
            });
        }

        res.json({
            status: 'success',
            message: 'Carrito actualizado',
            cart
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: 'Error al actualizar carrito',
            details: error.message 
        });
    }
});

export default router;




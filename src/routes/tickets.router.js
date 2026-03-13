import { Router } from 'express';
import TicketModel from '../models/ticket.model.js';
import { authenticateJWT, authorize } from '../middlewares/auth.middleware.js';
import purchaseService from '../services/purchase.service.js';

const router = Router();

router.get('/', authenticateJWT, authorize('admin'), async (req, res) => {
    try {
        const tickets = await TicketModel.find()
            .populate('products.product')
            .sort({ purchase_datetime: -1 });

        res.json({
            status: 'success',
            payload: tickets
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Error al obtener tickets',
            details: error.message
        });
    }
});

router.get('/:tid', authenticateJWT, async (req, res) => {
    try {
        const { tid } = req.params;
        const ticket = await TicketModel.findById(tid)
            .populate('products.product');

        if (!ticket) {
            return res.status(404).json({
                status: 'error',
                error: 'Ticket no encontrado'
            });
        }
        if (req.user.role !== 'admin' && ticket.purchaser !== req.user.email) {
            return res.status(403).json({
                status: 'error',
                error: 'No tienes permiso para ver este ticket'
            });
        }

        res.json({
            status: 'success',
            payload: ticket
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Error al obtener ticket',
            details: error.message
        });
    }
})

router.get('/user/my-tickets', authenticateJWT, async (req, res) => {
    try {
        const tickets = await TicketModel.find({ purchaser: req.user.email })
            .populate('products.product')
            .sort({ purchase_datetime: -1 });

        res.json({
            status: 'success',
            payload: tickets
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Error al obtener tickets',
            details: error.message
        });
    }
});

export default router;
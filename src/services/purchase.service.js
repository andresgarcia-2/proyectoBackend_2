import cartRepository from '../repositories/cart.repository.js';
import productRepository from '../repositories/product.repository.js';
import ticketRepository from '../repositories/ticket.repository.js';
import mailService from './mail.service.js';

export class PurchaseService {
    async processPurchase(cartId, userEmail) {
        const cart = await cartRepository.getById(cartId);
        if (!cart || cart.products.length === 0) {
            throw new Error('El carrito está vacío o no existe');
        }

        const successItems = [];
        const failedItems = [];

        for (const item of cart.products) {
            const product = await productRepository.getById(item.product._id);

            if (!product || product.stock < item.quantity) {
                failedItems.push({
                    product: item.product._id,
                    title: item.product.title,
                    requested: item.quantity,
                    available: product?.stock ?? 0
                });
            } else {
                await productRepository.updateStock(item.product._id, item.quantity);
                successItems.push({
                    product: item.product._id,
                    title: item.product.title,
                    quantity: item.quantity,
                    price: item.product.price,
                    subtotal: item.product.price * item.quantity
                });
            }
        }

        if (successItems.length === 0) {
            throw new Error('Ningún producto tiene stock suficiente');
        }

        const totalAmount = successItems.reduce((acc, item) => acc + item.subtotal, 0);
        const status = failedItems.length > 0 ? 'partial' : 'completed';


        const ticket = await ticketRepository.create({
            amount: totalAmount,
            purchaser: userEmail,
            products: successItems,
            status
        });

        if (failedItems.length > 0) {
            const remainingProducts = cart.products.filter(item =>
                failedItems.some(f => f.product.toString() === item.product._id.toString())
            );
            await cartRepository.update(cartId, remainingProducts);
        } else {
            await cartRepository.clearCart(cartId);
        }

        const populatedTicket = await ticketRepository.getById(ticket._id);
        await mailService.sendPurchaseConfirmationEmail(userEmail, populatedTicket);

        return {
            ticket: populatedTicket,
            failedItems,
            status
        };
    }
}

export default new PurchaseService();
import cartDAO from '../dao/cart.dao.js';

export class CartRepository {
    async getById(id) {
        return await cartDAO.findById(id);
    }

    async create() {
        return await cartDAO.create();
    }

    async addProduct(cartId, productId, quantity = 1) {
        return await cartDAO.addProduct(cartId, productId, quantity);
    }

    async updateProductQuantity(cartId, productId, quantity) {
        return await cartDAO.updateProductQuantity(cartId, productId, quantity);
    }

    async removeProduct(cartId, productId) {
        return await cartDAO.removeProduct(cartId, productId);
    }

    async clearCart(cartId) {
        return await cartDAO.clearCart(cartId);
    }

    async update(cartId, products) {
        return await cartDAO.update(cartId, products);
    }
}

export default new CartRepository();
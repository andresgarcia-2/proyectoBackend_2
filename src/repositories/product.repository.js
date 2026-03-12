import productDAO from '../dao/product.dao.js';
import { ProductDTO } from '../dto/product.dto.js';

export class ProductRepository {
    async getAll(filters = {}, options = {}) {
        const result = await productDAO.findAll(filters, options);
        return {
            ...result,
            docs: result.docs.map(p => new ProductDTO(p))
        };
    }

    async getById(id) {
        const product = await productDAO.findById(id);
        if (!product) return null;
        return new ProductDTO(product);
    }

    async create(productData) {
        const existing = await productDAO.findByCode(productData.code);
        if (existing) {
            throw new Error('Ya existe un producto con ese código');
        }
        const product = await productDAO.create(productData);
        return new ProductDTO(product);
    }

    async update(id, updateData) {
        const product = await productDAO.update(id, updateData);
        if (!product) return null;
        return new ProductDTO(product);
    }

    async delete(id) {
        return await productDAO.delete(id);
    }

    async updateStock(id, quantity) {
        return await productDAO.updateStock(id, quantity);
    }
}

export default new ProductRepository();
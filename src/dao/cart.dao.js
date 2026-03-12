import ProductModel from '../models/product.model.js';

export class ProductDAO {
    async findAll(filters = {}, options = {}) {
        const {
            limit = 10,
            page = 1,
            sort = {}
        } = options;

        return await ProductModel.paginate(filters, {
            limit,
            page,
            sort,
            lean: true
        });
    }

    async findById(id) {
        return await ProductModel.findById(id);
    }

    async findByCode(code) {
        return await ProductModel.findOne({ code });
    }

    async create(productData) {
        return await ProductModel.create(productData);
    }

    async update(id, updateData) {
        return await ProductModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
    }

    async delete(id) {
        return await ProductModel.findByIdAndDelete(id);
    }

    async updateStock(id, quantity) {
        return await ProductModel.findByIdAndUpdate(
            id,
            { $inc: { stock: -quantity } },
            { new: true }
        );
    }
}

export default new ProductDAO();

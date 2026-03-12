import TicketModel from '../models/ticket.model.js';

export class TicketDAO {
    async findAll() {
        return await TicketModel.find()
            .populate('products.product')
            .sort({ createdAt: -1 });
    }

    async findById(id) {
        return await TicketModel.findById(id)
            .populate('products.product');
    }

    async findByCode(code) {
        return await TicketModel.findOne({ code })
            .populate('products.product');
    }

    async findByPurchaser(email) {
        return await TicketModel.find({ purchaser: email })
            .populate('products.product')
            .sort({ createdAt: -1 });
    }

    async create(ticketData) {
        return await TicketModel.create(ticketData);
    }
}

export default new TicketDAO();
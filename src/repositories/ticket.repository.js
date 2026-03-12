import ticketDAO from '../dao/ticket.dao.js';

export class TicketRepository {
    async getAll() {
        return await ticketDAO.findAll();
    }

    async getById(id) {
        return await ticketDAO.findById(id);
    }

    async getByCode(code) {
        return await ticketDAO.findByCode(code);
    }

    async getByPurchaser(email) {
        return await ticketDAO.findByPurchaser(email);
    }

    async create(ticketData) {
        return await ticketDAO.create(ticketData);
    }
}

export default new TicketRepository();
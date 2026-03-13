import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });
    }

    async sendPasswordResetEmail(email, resetToken) {
        const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Recuperación de Contraseña - E-commerce',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Recuperación de Contraseña</h2>
                    <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                    <a href="${resetLink}" style="
                        display: inline-block;
                        padding: 12px 30px;
                        background-color: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    ">Restablecer Contraseña</a>
                    <p style="color: #666; font-size: 12px;">Este enlace expirará en <strong>1 hora</strong>.</p>
                    <p style="color: #666; font-size: 12px;">Si no solicitaste este cambio, ignora este correo.</p>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            throw new Error('No se pudo enviar el email de recuperación');
        }
    }

    async sendPurchaseConfirmationEmail(email, ticket) {
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: `Confirmación de Compra - Ticket #${ticket.code}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #28a745;">¡Compra Exitosa!</h2>
                    <p>Tu compra ha sido procesada correctamente.</p>
                    <h3>Detalles del Ticket</h3>
                    <p><strong>Código:</strong> ${ticket.code}</p>
                    <p><strong>Fecha:</strong> ${new Date(ticket.purchase_datetime).toLocaleString()}</p>
                    <p><strong>Total:</strong> $${ticket.amount.toFixed(2)}</p>
                    <h3>Productos</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 8px; border: 1px solid #dee2e6;">Producto</th>
                                <th style="padding: 8px; border: 1px solid #dee2e6;">Cantidad</th>
                                <th style="padding: 8px; border: 1px solid #dee2e6;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ticket.products.map(item => `
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #dee2e6;">${item.product.title}</td>
                                    <td style="padding: 8px; border: 1px solid #dee2e6;">${item.quantity}</td>
                                    <td style="padding: 8px; border: 1px solid #dee2e6;">$${item.subtotal.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <p style="margin-top: 20px; color: #666;">Gracias por tu compra.</p>
                </div>
            `
        };

        await this.transporter.sendMail(mailOptions);
    }
}

export default new MailService();
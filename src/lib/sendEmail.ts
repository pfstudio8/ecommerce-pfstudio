import nodemailer from 'nodemailer';
import { generateWelcomeEmail, generateOrderEmail } from './emailTemplates';

// Create a transporter using standard SMTP (ej. Gmail App Passwords)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS
    }
});

export const sendPurchaseSuccessEmail = async (toEmail: string, orderId: string, totalAmount: number, items: any[] = []) => {
    try {
        const mailOptions = {
            from: `"PFSTUDIO" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: '¡Gracias por tu compra en PFSTUDIO! 🎉',
            html: generateOrderEmail(orderId, toEmail, totalAmount, items)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${toEmail} [${info.messageId}]`);
    } catch (error) {
        console.error("Error sending order email:", error);
    }
};

export const sendWelcomeEmail = async (toEmail: string) => {
    try {
        const mailOptions = {
            from: `"PFSTUDIO" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: '¡Bienvenido a PFSTUDIO! 👋',
            html: generateWelcomeEmail(toEmail)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${toEmail} [${info.messageId}]`);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
};

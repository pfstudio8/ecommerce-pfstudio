import { Resend } from 'resend';
import { generateWelcomeEmail, generateOrderEmail, generateAbandonedCartEmail } from './emailTemplates';

// Inicializar Resend con la API Key del entorno (requiere que configures RESEND_API_KEY en tu .env)
const resend = new Resend(process.env.RESEND_API_KEY);

// Dominio de envío por defecto (idealmente un dominio verificado en Resend como ventas@pfstudio.com.ar)
const fromEmail = process.env.EMAIL_FROM || 'ventas@pfstudio.com.ar';

export const sendPurchaseSuccessEmail = async (toEmail: string, orderId: string, totalAmount: number, items: any[] = [], billingDetails: any = null) => {
    try {
        const { data, error } = await resend.emails.send({
            from: `PFSTUDIO <${fromEmail}>`,
            to: [toEmail],
            subject: '¡Gracias por tu compra en PFSTUDIO! 🎉',
            html: generateOrderEmail(orderId, toEmail, totalAmount, items, billingDetails)
        });

        if (error) {
            console.error("Resend API Error (Order):", error);
            return;
        }
        console.log(`Confirmation email sent via Resend [${data?.id}]`);
    } catch (error) {
        console.error("Error sending order email via Resend:", error);
    }
};

export const sendWelcomeEmail = async (toEmail: string, name?: string) => {
    try {
        const { data, error } = await resend.emails.send({
            from: `PFSTUDIO <${fromEmail}>`,
            to: [toEmail],
            subject: '¡Bienvenido a PFSTUDIO! 🎉',
            html: generateWelcomeEmail(toEmail, name)
        });

        if (error) {
            console.error("Resend API Error (Welcome):", error);
            return;
        }
        console.log(`Welcome email sent via Resend [${data?.id}]`);
    } catch (error) {
        console.error("Error sending welcome email via Resend:", error);
    }
};

export const sendAbandonedCartEmail = async (toEmail: string) => {
    try {
        const { data, error } = await resend.emails.send({
            from: `PFSTUDIO <${fromEmail}>`,
            to: [toEmail],
            subject: '¡Te olvidaste algo en el carrito! 🛒',
            html: generateAbandonedCartEmail(toEmail)
        });

        if (error) {
            console.error("Resend API Error (Abandoned Cart):", error);
            return;
        }
        console.log(`Abandoned cart email sent via Resend [${data?.id}]`);
    } catch (error) {
        console.error("Error sending abandoned cart email via Resend:", error);
    }
};

import nodemailer from 'nodemailer';

// Create a transporter using standard SMTP (ej. Gmail App Passwords)
const transporter = nodemailer.createTransport({
    service: 'gmail', // or configured differently if you use hosting mail
    auth: {
        user: process.env.EMAIL_USER, // e.g. facundoesquivel03@gmail.com
        pass: process.env.EMAIL_PASS  // The App Password, NOT the normal password
    }
});

export const sendPurchaseSuccessEmail = async (toEmail: string, orderId: string, totalAmount: number) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: '¡Gracias por tu compra en PFSTUDIO! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">¡Tu pago fue exitoso!</h2>
                    <p style="font-size: 16px; color: #555;">Hola,</p>
                    <p style="font-size: 16px; color: #555;">Queremos agradecerte por darnos tu confianza. Hemos recibido el pago de tu orden <strong>#${orderId.substring(0, 8)}</strong> por un total de <strong>$${totalAmount.toLocaleString('es-AR')}</strong>.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold;">Próximos pasos:</p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Nos pondremos en contacto contigo pronto con los detalles del envío de tus prendas.</p>
                    </div>

                    <p style="font-size: 14px; color: #888;">Si tienes alguna pregunta, no dudes en responder este correo o contactarnos por nuestro WhatsApp.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #aaa; text-align: center;">El equipo de PFSTUDIO</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${toEmail}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

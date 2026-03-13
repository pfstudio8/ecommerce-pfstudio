export const generateWelcomeEmail = (email: string) => {
    return `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 0.1em; color: #111;">PFSTUDIO</h1>
      </div>
      <div style="padding: 40px 20px; background-color: #fafafa; border-radius: 8px; margin-top: 20px;">
        <h2 style="margin-top: 0; color: #111;">¡Bienvenido a PF Studio!</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Hola <strong>${email}</strong>,
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Gracias por registrarte en nuestra tienda. Estamos muy felices de tenerte con nosotros. 
          Explora nuestra colección de prendas Oversize, Boxy Fit y Clásicas.
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" style="background-color: #111; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Ir a la tienda</a>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} PF Studio. Todos los derechos reservados.
      </div>
    </div>
    `;
};

export const generateOrderEmail = (orderId: string, email: string, total: number, items: any[]) => {
    const itemsHtml = items.map((item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
          <strong>${item.name || item.title}</strong>
          ${item.size ? `<br><small style="color: #777;">Talle: ${item.size}</small>` : ''}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toLocaleString("es-AR")}</td>
      </tr>
    `).join("");

    return `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 0.1em; color: #111;">PFSTUDIO</h1>
      </div>
      <div style="padding: 40px 20px; background-color: #fafafa; border-radius: 8px; margin-top: 20px;">
        <h2 style="margin-top: 0; color: #111;">¡Gracias por tu compra!</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Hola <strong>${email}</strong>,
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Hemos recibido tu pedido <strong>#${orderId.split('-')[0]}</strong> y estamos preparándolo. 
          Aquí tienes el resumen de tu compra:
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left;">
          <thead>
            <tr>
              <th style="padding-bottom: 10px; border-bottom: 2px solid #ddd;">Producto</th>
              <th style="padding-bottom: 10px; border-bottom: 2px solid #ddd; text-align: center;">Cantidad</th>
              <th style="padding-bottom: 10px; border-bottom: 2px solid #ddd; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding-top: 15px; text-align: right; font-weight: bold;">Total del Pedido:</td>
              <td style="padding-top: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #111;">$${total.toLocaleString("es-AR")}</td>
            </tr>
          </tfoot>
        </table>

      </div>
      <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
        Si tienes alguna duda, responde a este correo.<br>
        © ${new Date().getFullYear()} PF Studio. Todos los derechos reservados.
      </div>
    </div>
    `;
};

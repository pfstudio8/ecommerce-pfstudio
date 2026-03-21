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

export const generateOrderEmail = (orderId: string, email: string, total: number, items: any[], billingDetails: any = null) => {
    const itemsHtml = items.map((item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
          <strong>${item.name || item.title || item.id}</strong>
          ${item.size ? `<br><small style="color: #777;">Talle: ${item.size}</small>` : ''}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">$${(item.unit_price || item.price || 0) * item.quantity}</td>
      </tr>
    `).join("");

    const billingHtml = billingDetails ? `
      <div style="margin-top: 30px; padding: 20px; background-color: #f0f0f0; border-radius: 6px; border-left: 4px solid #111;">
        <h3 style="margin-top: 0; color: #111; font-size: 16px;">Datos de Facturación / Comprobante</h3>
        <p style="margin: 5px 0; font-size: 14px; color: #444;"><strong>Nombre/Razón Social:</strong> ${billingDetails.name}</p>
        <p style="margin: 5px 0; font-size: 14px; color: #444;"><strong>DNI/CUIT:</strong> ${billingDetails.dni}</p>
        <p style="margin: 5px 0; font-size: 14px; color: #444;"><strong>Teléfono:</strong> ${billingDetails.phone}</p>
        <p style="margin: 5px 0; font-size: 14px; color: #444;"><strong>Dirección:</strong> ${billingDetails.address}</p>
      </div>
    ` : '';

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

        ${billingHtml}

      </div>
      <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
        Si tienes alguna duda, responde a este correo.<br>
        © ${new Date().getFullYear()} PF Studio. Todos los derechos reservados.
      </div>
    </div>
    `;
};

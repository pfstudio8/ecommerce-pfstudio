export const generateWelcomeEmail = (email: string, name?: string) => {
    const displayName = name || email.split('@')[0];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pfstudio.com.ar';

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Bienvenido a PFSTUDIO!</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f3e9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1d1c16;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f3e9; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #fef9ef; border: 1px solid #e6e0d4; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
              
              <!-- HEADER -->
              <tr>
                <td align="center" style="padding: 35px 20px 25px 20px; background-color: #fef9ef; border-bottom: 1px solid #e6e0d4;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 0.15em; color: #1d1c16; text-transform: uppercase;">
                    PF<span style="color: #4b5319;">STUDIO</span>
                  </h1>
                  <p style="margin: 6px 0 0 0; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: #4b5319; text-transform: uppercase;">
                    Custom & Sublimación Premium
                  </p>
                </td>
              </tr>

              <!-- BODY CONTENT -->
              <tr>
                <td style="padding: 40px 30px;">
                  <div style="display: inline-block; background-color: rgba(75, 83, 25, 0.1); border: 1px solid rgba(75, 83, 25, 0.2); border-radius: 20px; padding: 6px 16px; margin-bottom: 20px;">
                    <span style="color: #4b5319; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">¡CUENTA ACTIVADA!</span>
                  </div>

                  <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #1d1c16; line-height: 1.3;">
                    ¡Hola, ${displayName}! 👋
                  </h2>

                  <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #4a483c;">
                    Te damos la bienvenida oficial a <strong style="color: #1d1c16;">PFSTUDIO</strong>. Tu cuenta se ha registrado correctamente y ya podés explorar nuestra tienda online, elegir tus insumos o personalizar tus propias prendas de sublimación.
                  </p>

                  <!-- HIGHLIGHT BOX -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f3e9; border: 1px solid #e6e0d4; border-radius: 12px; margin: 25px 0;">
                    <tr>
                      <td style="padding: 20px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #4b5319; text-transform: uppercase;">
                          ✨ Lo que podés hacer en PFSTUDIO:
                        </h3>
                        <ul style="margin: 0; padding-left: 20px; color: #4a483c; font-size: 14px; line-height: 1.8;">
                          <li><strong>Sublimación Custom:</strong> Personalizá remeras, chopps, gorras, llaveros y tazas con tus diseños.</li>
                          <li><strong>Colecciones Exclusivas:</strong> Remeras Oversize, Boxy Fit y cortes clásicos.</li>
                          <li><strong>Envíos Rápidos:</strong> Comprá online en segundos con total seguridad.</li>
                        </ul>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA BUTTON -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
                    <tr>
                      <td align="center">
                        <a href="${baseUrl}" target="_blank" style="background-color: #d1a600; color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 12px; font-weight: 900; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; display: inline-block; box-shadow: 0 4px 15px rgba(209, 166, 0, 0.3);">
                          Explorar Tienda Online
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td align="center" style="padding: 25px 20px; background-color: #f2ede4; border-top: 1px solid #e6e0d4; font-size: 12px; color: #767465;">
                  <p style="margin: 0 0 8px 0; font-weight: 600;">
                    Si tenés alguna consulta, podés responder directamente a este correo.
                  </p>
                  <p style="margin: 0;">
                    © ${new Date().getFullYear()} PFSTUDIO. Todos los derechos reservados.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
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

export const generateAbandonedCartEmail = (email: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pfstudio.com.ar';

    return `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333; background-color: #fafafa; padding: 40px 20px; border-radius: 8px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ddd;">
        <h1 style="margin: 0; font-size: 28px; letter-spacing: 0.15em; color: #111;">PFSTUDIO</h1>
      </div>
      
      <div style="padding: 30px 10px; text-align: center;">
        <h2 style="color: #111; font-size: 22px;">¡Olvidaste algo en tu carrito! 🛒</h2>
        
        <p style="font-size: 16px; line-height: 1.6; color: #555; margin-top: 20px;">
          Hola <strong>${email.split('@')[0]}</strong>,<br><br>
          Notamos que estuviste navegando por nuestra tienda y dejaste algunos productos increíbles esperando por ti. 
          ¡No dejes que se escapen!
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Hacé clic en el botón de abajo para volver a la tienda y finalizar tu compra de manera segura.
        </p>

        <div style="margin: 40px 0;">
          <a href="${baseUrl}" style="background-color: #111; color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em;">
            Continuar mi Compra
          </a>
        </div>
      </div>

      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
        Si ya finalizaste tu compra o esto es un error, por favor ignora este correo.<br>
        © ${new Date().getFullYear()} PF Studio. Todos los derechos reservados.
      </div>
    </div>
    `;
};

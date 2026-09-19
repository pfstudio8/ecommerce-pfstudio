# 🛡️ Guía de Seguridad y Mejores Prácticas para E-Commerce

¡Hola! Este documento está diseñado para ayudarte a entender cómo protegemos tu tienda online (e-commerce), los datos de tus clientes y las operaciones de negocio. 

Como en una tienda física necesitas cerraduras, cámaras de seguridad y cajas fuertes, en el mundo digital necesitamos implementar "barreras" para que nadie no autorizado acceda a la información. 

Aquí te explico los pilares que cuidamos en tu código y arquitectura:

---

## 1. 🔐 Autenticación y Autorización (Quién eres y qué puedes hacer)

**El concepto:**
No es lo mismo entrar a la tienda como *Cliente* que entrar como *Dueño (Administrador)*. 
- **Autenticación:** Comprobar que alguien es quien dice ser (ej. iniciar sesión con email y contraseña o Google).
- **Autorización:** Comprobar si ese usuario tiene permiso para ver o modificar algo.

**Cómo lo aplicamos en tu código:**
- **Supabase Auth:** No programamos el inicio de sesión desde cero ni guardamos contraseñas "en texto plano" (lo cual es muy peligroso). Utilizamos las herramientas de seguridad de Supabase que encriptan automáticamente las contraseñas.
- **Row Level Security (RLS):** Es una tecnología de Supabase que actúa como un guardia de seguridad por cada fila de la base de datos. Nos aseguramos de que el Usuario A **solo** pueda ver los recibos y datos del Usuario A, y jamás los del Usuario B. Solo los administradores pueden ver todos los pedidos.

---

## 2. 💳 Pagos Seguros y Datos Sensibles (El dinero y la privacidad)

**El concepto:**
Si manejas información sensible (como direcciones o datos financieros), eres un blanco atractivo para atacantes.

**Cómo lo aplicamos en tu código:**
- **No tocamos las tarjetas de crédito:** Tu servidor nunca recibe, lee, ni guarda los números de tarjeta de crédito. Usamos **Mercado Pago** como "Pasarela de Pago". El usuario ingresa sus datos directamente en el sistema de Mercado Pago, y nosotros solo recibimos un aviso de "Pago Aprobado" o "Pago Rechazado".
- **Variables de Entorno Secretas:** Las llaves privadas (Tokens) que nos comunican con Mercado Pago o Supabase se guardan en un archivo especial (`.env`) que nunca se sube al código público y nunca se envía a la computadora del cliente.

---

## 3. 🛡️ Protección contra Ataques Comunes de Hackers

Existen varias formas en las que los hackers intentan engañar a las aplicaciones. Nos protegemos de ellas así:

*   **Inyección SQL:** Ocurre cuando un atacante escribe código malicioso en la barra de búsqueda o en un formulario intentando borrar o robar la base de datos.
    *   *Nuestra defensa:* Al utilizar el cliente de Supabase/Prisma, los datos siempre se envían "limpios" y separados de los comandos de la base de datos. Es imposible inyectar código.
*   **Cross-Site Scripting (XSS):** Ocurre cuando un atacante intenta inyectar virus o scripts falsos en los comentarios o nombres de usuario para que otros clientes los ejecuten sin querer.
    *   *Nuestra defensa:* Frameworks modernos como **Next.js y React** (con los que está construida tu app) automáticamente "limpian" cualquier texto que el usuario ingrese antes de mostrarlo en pantalla.
*   **Manipulación del Carrito (Client-side tampering):** Ocurre cuando un usuario "hackea" su propio navegador para cambiar el precio de una remera de $15.000 a $1.
    *   *Nuestra defensa:* El precio final **nunca** se calcula confiando en lo que dice el carrito del navegador. Cuando se genera la orden de pago, nuestro servidor recalcula el total consultando los precios reales directamente desde la base de datos, de forma segura.

---

## 4. 🗄️ Integridad y Respaldo de Datos (Backups)

**El concepto:**
¿Qué pasa si por error borramos una tabla o la base de datos se cae? Necesitamos un plan B.

**Cómo lo aplicamos:**
- Usar un servicio profesional en la nube (Supabase) nos provee de **Backups Automáticos** regulares. 
- Recomendación: En el panel de Supabase (PITR - Point In Time Recovery) puedes configurar para poder restaurar tu base de datos a cómo estaba hace 1 minuto o hace 1 día si ocurre un desastre.
- Para borrar entidades importantes (como usuarios o pedidos) implementamos confirmaciones ("¿Estás seguro?") y, preferentemente, se recomienda un "Soft Delete" (marcar como inactivo en lugar de borrar para siempre).

---

## 6. 🛡️ Capas Adicionales de Seguridad en el Servidor (Headers y Middleware)

Además de lo anterior, acabamos de aplicar dos escudos extra directamente en el servidor (Next.js):

*   **HTTP Security Headers:** Hemos configurado `next.config.ts` para decirle al navegador de los clientes cómo comportarse de forma segura.
    *   `X-XSS-Protection`: Obliga al navegador a bloquear la página si detecta un intento de ataque XSS.
    *   `Permissions-Policy`: Le prohíbe explícitamente a nuestra aplicación intentar acceder a la cámara, micrófono o ubicación del usuario, protegiendo su privacidad.
    *   `X-Frame-Options (DENY)`: Evita que otra página web maliciosa incruste tu tienda dentro de un *iframe* oculto para engañar a tus clientes (ataque conocido como Clickjacking).
    *   `Strict-Transport-Security (HSTS)`: Obliga a todas las conexiones a ser a través de HTTPS seguro.
*   **Middleware de Protección de Rutas (Edge Computing):** Antes de que la página cargue, un "policía de tránsito" revisa cada visita al panel de `/admin`. Si el visitante no está logueado o su correo no figura en tu lista de administradores autorizados, la conexión se rechaza al instante y son redirigidos al inicio. Esto consume cero recursos de tu base de datos y es impenetrable.

---

## 7. 🚀 Tu Rol como Administrador

Aunque el sistema es seguro, gran parte de la seguridad depende de ti:
1. **Contraseñas Seguras:** Tu cuenta de administrador y tu cuenta de Supabase deben tener contraseñas únicas y largas, y de ser posible, Autenticación de Dos Pasos (2FA).
2. **Cuidado con a quién le das acceso:** Solo otorga permisos de "Administrador" a personas de extrema confianza configurando la variable `ADMIN_EMAILS`.
3. **No compartas tu archivo `.env`:** Ese archivo contiene las llaves maestras de tu tienda. Nunca lo envíes por WhatsApp ni lo subas a sitios públicos.

---
*Este documento se mantendrá vivo y actualizado a medida que la tienda crezca.*

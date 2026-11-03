# PFSTUDIO — E-Commerce & Taller de Indumentaria

Plataforma de comercio electrónico y gestión integral para taller y tienda de indumentaria textil. Desarrollada con **Next.js 16**, **Supabase (PostgreSQL + RLS)**, **Tailwind CSS**, **Zustand** y pago por **Transferencia Bancaria directa**.

---

## 🚀 Arquitectura y Stack Tecnológico

- **Frontend & Fullstack Framework**: [Next.js 16 (App Router)](https://nextjs.org/) con Turbopack y TypeScript estricto.
- **Base de Datos & Autenticación**: [Supabase](https://supabase.com/) (PostgreSQL 15+, Row Level Security, Triggers y Funciones SQL Atómicas).
- **Gestión de Estado**: [Zustand](https://github.com/pmndrs/zustand) para carrito y estados de interfaz.
- **Estilos & Animaciones**: [Tailwind CSS v4](https://tailwindcss.com/) y [Lucide React](https://lucide.dev/).
- **Rate Limiting & Anti-Abuso**: [@upstash/ratelimit](https://upstash.com/) con Redis para protección contra ataques de fuerza bruta y agotamiento de inventario.
- **Emails Transaccionales**: [Resend](https://resend.com/) con sanitización estricta de HTML contra XSS.
- **Test Runner**: Node.js 24 Native Test Runner (`node --test`).

---

## 🗄️ Modelo de Datos y Migraciones

El esquema se encuentra versionado en `supabase/migrations/`:

| Tabla | Propósito y Reglas de Negocio |
|---|---|
| `profiles` | Usuarios con rol único: `admin`, `employee`, `customer`. Reemplaza listas hardcodeadas y centraliza permisos. |
| `products` | Catálogo de productos con soporte de **baja lógica** (`active = false`). Nunca se borran registros para mantener integridad con pedidos pasados. |
| `product_stock` | Control de stock por variante/talle de cada producto. |
| `stock_movements` | Auditoría de inventario: registra `quantity_delta`, `reason`, `created_by` y fecha exacta de cada cambio. |
| `orders` | Pedidos con estado (`pending`, `paid`, `shipped`, `delivered`, `cancelled`). |
| `order_items` | **Snapshot inmutable**: copia el nombre y precio unitario exactos al momento de la compra para que futuros cambios de catálogo no alteren el histórico. |
| `settings` | Configuración administrable: datos bancarios (`bank_info`), información de contacto y WhatsApp (`store_info`), redes sociales. |

### Seguridad y RLS (Row Level Security)
- Acceso público a funciones atómicas como `decrement_stock` ha sido **revocado**.
- Las llamadas de actualización de stock y creación de órdenes son procesadas exclusivamente en el servidor a través de endpoints seguros (`/api/checkout`) con service role verificado.

---

## 💳 Flujo de Compra: Transferencia Bancaria

La plataforma elimina intermediarios y comisiones de pasarelas de pago utilizando transferencia directa con validación manual:

1. **Carrito y Validación Server-Side**:
   - El carrito valida stock y precios contra el servidor en `/api/cart/validate` para evitar inconsistencias o precios desactualizados en el navegador.
2. **Checkout con Validación Zod**:
   - El usuario completa sus datos (Nombre, Email, Teléfono, Método de Entrega: Retiro en Taller o Envío con Dirección).
3. **Creación Atómica del Pedido (`POST /api/checkout`)**:
   - Protegido con **Rate Limiting de Upstash** (máximo 5 pedidos/min por IP).
   - El servidor recalcula el total consultando la base de datos (protección contra manipulación de precios desde las DevTools del cliente).
   - Valida disponibilidad y descuenta el stock de manera atómica con rollback en caso de error.
   - Crea el pedido con estado `pending`.
4. **Pantalla de Confirmación de Pedido**:
   - Muestra la tarjeta con los datos bancarios configurados en el panel admin:
     - Banco / App
     - Titular de la cuenta
     - CBU / CVU
     - Alias
     - Monto exacto y Número de Pedido como referencia
   - Botón interactivo para **Copiar CBU/Alias** al portapapeles.
   - Botón directo para **Enviar comprobante por WhatsApp** con mensaje preformateado.
5. **Aprobación Manual en el Dashboard**:
   - El administrador o empleado verifica el pago en su cuenta bancaria y confirma el pedido desde el panel de administración, pasando el estado a `paid`.

---

## ✂️ Pedidos Personalizados

En lugar de editores 3D pesados que ralentizan la carga móvil, el taller ofrece una sección directa **"Consultá por WhatsApp"**:
- Botón directo con mensaje contextual hacia el WhatsApp oficial configurado en el sistema.
- Comunicación rápida y personalizada con el equipo de confección y diseño.

---

## 🛡️ Seguridad y Buenas Prácticas

- **Rate Limiting con Upstash Redis**:
  - Checkout: 5 solicitudes / minuto.
  - Validación de carrito: 30 solicitudes / minuto.
  - Formulario de contacto: 5 mensajes / hora.
- **Escape HTML en Emails**:
  - Todos los parámetros de entrada del usuario en correos (nombre, notas, dirección, talles) son sanitizados con `escapeHtml` para mitigar vectores de Inyección HTML y Cross-Site Scripting (XSS).
- **Content Security Policy (CSP)**:
  - Implementado en `src/proxy.ts` (Next.js middleware) para restringir scripts, estilos y orígenes no autorizados.

---

## 🧪 Tests Automatizados

La suite de pruebas unitarias evalúa la lógica crítica de negocio sin dependencias externas:

```bash
npm test
```

### Cobertura de pruebas:
- `tests/checkout-validation.test.ts`:
  - Validación de esquemas Zod (requerimientos de envío vs. retiro).
  - Detección y anulación de manipulación de precios desde el cliente.
  - Ajuste de cantidades cuando el cliente solicita más unidades que el stock disponible.
  - Bloqueo de compras cuando un producto está sin stock (`0` unidades).
- `tests/inventory-stock.test.ts`:
  - Descuento atómico de stock.
  - Lanzamiento de excepciones ante stock insuficiente.
  - Auditoría de movimientos de stock con cálculo de deltas y motivos.
  - Creación de snapshot inmutable de precios y nombres en `order_items`.
- `tests/security-ratelimit-escape.test.ts`:
  - Sanitización de caracteres peligrosos (`<`, `>`, `&`, `"`, `'`).
  - Seguridad en plantillas de bienvenida, confirmación de orden y carritos.

---

## ⚙️ Variables de Entorno

Copia el archivo `.env.example` a `.env.local` y completa los valores requeridos:

```bash
cp .env.example .env.local
```

### Variables principales:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Upstash Redis (Obligatorio para Rate Limiting en Producción)
UPSTASH_REDIS_REST_URL=https://tu-base.upstash.io
UPSTASH_REDIS_REST_TOKEN=tu-upstash-token

# Resend (Emails)
RESEND_API_KEY=re_tu_api_key
RESEND_FROM_EMAIL=ventas@pfstudio.com

# URL pública de la aplicación
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

---

## 💻 Desarrollo Local

1. Instalar dependencias:
   ```bash
   pnpm install  # o npm install
   ```
2. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.
4. Ejecutar verificación de tipos:
   ```bash
   npx tsc --noEmit
   ```

---

## 🚢 Despliegue en Vercel

1. **Importar el Repositorio**:
   - Conecta tu cuenta de GitHub/GitLab en [Vercel](https://vercel.com).
   - Selecciona el repositorio `ecommerce-pfstudio`.
2. **Configuración de Proyecto**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./` (raíz del proyecto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
3. **Variables de Entorno**:
   - En la sección **Environment Variables** de Vercel, agrega todas las variables listadas en `.env.example` (en particular `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`).
4. **Deploy**:
   - Haz clic en **Deploy**. Cada push a la rama `main` generará un despliegue automático en producción.

---

## 💾 Configuración de Backups en Supabase

Para garantizar la integridad y recuperación de datos de ventas, clientes e inventario:

### 1. Backups Automatizados de Supabase
- En el **Supabase Dashboard**, dirígete a **Database** → **Backups**.
- **Proyectos Free**: Supabase realiza copias de seguridad lógicas diarias de forma automática.
- **Proyectos Pro**: Activa **Point-In-Time Recovery (PITR)** para restaurar la base de datos a cualquier segundo específico de los últimos 7 a 28 días.

### 2. Backups Lógicos Manuales vía Supabase CLI
Puedes generar volcados completos de la estructura y los datos ejecutando:

```bash
# Exportar esquema y datos de la base de datos
npx supabase db dump --project-ref TU_PROJECT_REF -f backup_$(date +%Y%m%d).sql

# Exportar solo datos
npx supabase db dump --project-ref TU_PROJECT_REF --data-only -f backup_data_$(date +%Y%m%d).sql
```

Se recomienda programar una tarea mensual o semanal para archivar copias de seguridad frías en almacenamiento seguro.

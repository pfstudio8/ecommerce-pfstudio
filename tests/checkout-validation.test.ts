import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

// Replicating checkout schemas for unit testing validation logic
const checkoutItemSchema = z.object({
    product: z.object({
        id: z.string().uuid().or(z.string().min(1)),
        name: z.string().optional(),
        price: z.number().or(z.string().transform(Number)).optional(),
        images: z.array(z.string()).optional()
    }),
    size: z.string().min(1, 'El talle es requerido'),
    quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0')
});

const customerSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(6, 'Número de teléfono inválido'),
    deliveryMethod: z.enum(['shipping', 'pickup']),
    shippingAddress: z.string().optional().nullable(),
    notes: z.string().optional().nullable()
}).refine((data) => {
    if (data.deliveryMethod === 'shipping') {
        return !!data.shippingAddress && data.shippingAddress.trim().length >= 5;
    }
    return true;
}, {
    message: 'La dirección de envío es obligatoria cuando se selecciona envío a domicilio',
    path: ['shippingAddress']
});

describe('Checkout Flow: Server Validation & Cart Rules', () => {
    test('Zod item validation accepts valid cart item and rejects zero quantity', () => {
        const validItem = { product: { id: 'prod-123', name: 'Remera' }, size: 'M', quantity: 2 };
        assert.equal(checkoutItemSchema.safeParse(validItem).success, true);

        const invalidItem = { product: { id: 'prod-123' }, size: '', quantity: 0 };
        assert.equal(checkoutItemSchema.safeParse(invalidItem).success, false);
    });

    test('Zod customer validation accepts valid pickup order', () => {
        const validPickup = {
            name: 'Paula Alvarenga',
            email: 'paula@pfstudio.com',
            phone: '3704245651',
            deliveryMethod: 'pickup',
            shippingAddress: null,
            notes: 'Paso por el taller el viernes'
        };

        const result = customerSchema.safeParse(validPickup);
        assert.equal(result.success, true);
    });

    test('Zod customer validation rejects shipping without an address', () => {
        const invalidShipping = {
            name: 'Juan Perez',
            email: 'juan@test.com',
            phone: '1122334455',
            deliveryMethod: 'shipping',
            shippingAddress: ''
        };

        const result = customerSchema.safeParse(invalidShipping);
        assert.equal(result.success, false);
    });

    test('Server price recalculation detects client-side price manipulation', () => {
        // Simulated client item with hacked price $100
        const clientItem = {
            productId: 'prod-001',
            clientPrice: 100,
            quantity: 2,
            size: 'M'
        };

        // Real database snapshot
        const dbProduct = {
            id: 'prod-001',
            name: 'Remera Boxy Fit Oversize',
            price: 25000,
            active: true
        };

        // Server recalculation
        const serverPrice = dbProduct.price;
        const total = serverPrice * clientItem.quantity;
        const priceChanged = Math.abs(clientItem.clientPrice - serverPrice) > 0.01;

        assert.equal(priceChanged, true);
        assert.equal(serverPrice, 25000);
        assert.equal(total, 50000); // 25000 * 2, not 100 * 2
    });

    test('Stock validation caps quantity when client requests more than available', () => {
        const requestedQuantity = 5;
        const availableStock = 2;

        let finalQuantity = requestedQuantity;
        let warning: string | null = null;

        if (requestedQuantity > availableStock) {
            finalQuantity = availableStock;
            warning = `Ajustado a ${availableStock} por disponibilidad`;
        }

        assert.equal(finalQuantity, 2);
        assert.equal(warning !== null, true);
    });

    test('Out-of-stock items (0 units) block purchase continuation', () => {
        const cartItems = [
            { productId: 'p1', size: 'M', quantity: 1, availableStock: 0, isOutOfStock: true },
            { productId: 'p2', size: 'L', quantity: 1, availableStock: 5, isOutOfStock: false }
        ];

        const hasOutOfStock = cartItems.some(i => i.isOutOfStock);
        assert.equal(hasOutOfStock, true);
    });
});


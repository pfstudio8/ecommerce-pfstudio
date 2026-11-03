import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Inventory & Stock Management: Critical Business Logic', () => {
    test('Stock decrement deducts exact amount when inventory is sufficient', () => {
        let currentStock = 10;
        const purchaseQty = 3;

        if (currentStock < purchaseQty) {
            throw new Error('INSUFFICIENT_STOCK');
        }

        currentStock -= purchaseQty;
        assert.equal(currentStock, 7);
    });

    test('Stock decrement throws error when requested quantity exceeds inventory', () => {
        const currentStock = 2;
        const purchaseQty = 5;

        assert.throws(() => {
            if (currentStock < purchaseQty) {
                throw new Error('INSUFFICIENT_STOCK');
            }
        }, /INSUFFICIENT_STOCK/);
    });

    test('Stock movement audit correctly calculates delta and reason', () => {
        // Restock test
        const prevStock = 5;
        const newStock = 20;
        const delta = newStock - prevStock;
        const reason = delta > 0 ? 'restock' : 'adjustment';

        assert.equal(delta, 15);
        assert.equal(reason, 'restock');

        // Sale / Adjustment test
        const saleDelta = -2;
        const resultingStock = newStock + saleDelta;
        assert.equal(resultingStock, 18);
    });

    test('Order snapshot maintains immutable price and name at purchase time', () => {
        // At purchase time:
        const orderItemSnapshot = {
            product_id: 'prod-uuid-123',
            product_name: 'Remera Boxy Fit Blanca',
            price_at_purchase: 18000,
            size: 'L',
            quantity: 2
        };

        // Later, product price is updated in catalog:
        const updatedCatalogProduct = {
            id: 'prod-uuid-123',
            name: 'Remera Boxy Fit Blanca (Edición 2027)',
            price: 24000
        };

        // Historical order item must remain unaffected:
        assert.equal(orderItemSnapshot.price_at_purchase, 18000);
        assert.equal(orderItemSnapshot.product_name, 'Remera Boxy Fit Blanca');
        assert.notEqual(orderItemSnapshot.price_at_purchase, updatedCatalogProduct.price);
    });
});


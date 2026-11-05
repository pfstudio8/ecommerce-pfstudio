"use server";

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireAdminOrEmployee } from '@/utils/supabase/auth';

export async function getInventoryData() {
    try {
        const supabaseAuth = await createClient();
        const adminClient = createAdminClient();

        await requireAdminOrEmployee(supabaseAuth);

        // 1. Obtener productos activos con sus variantes de stock
        const { data: productsData, error: productsError } = await adminClient
            .from('products')
            .select(`
                id,
                name,
                category,
                stock,
                active,
                images,
                product_stock(id, size, stock_quantity, sku)
            `)
            .eq('active', true)
            .order('name');

        if (productsError) throw productsError;

        // 2. Obtener los últimos 50 movimientos de stock
        const { data: movementsData, error: movementsError } = await adminClient
            .from('stock_movements')
            .select(`
                id,
                product_id,
                size,
                quantity_change,
                previous_stock,
                new_stock,
                reason,
                notes,
                created_at,
                products(name)
            `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (movementsError) {
            console.warn("Could not fetch stock movements:", movementsError);
        }

        return {
            success: true,
            products: productsData || [],
            movements: movementsData || []
        };
    } catch (error: any) {
        console.error("Error en getInventoryData:", error);
        return { success: false, error: error.message };
    }
}

export async function adjustStockVariant(params: {
    productId: string;
    size: string;
    newQuantity: number;
    reason: 'restock' | 'adjustment' | 'return' | 'manual';
    notes?: string;
}) {
    try {
        const supabaseAuth = await createClient();
        const adminClient = createAdminClient();

        const { user } = await requireAdminOrEmployee(supabaseAuth);

        const { productId, size, newQuantity, reason, notes } = params;

        if (newQuantity < 0) {
            throw new Error("La cantidad de stock no puede ser negativa.");
        }

        // Obtener el registro actual de product_stock
        const { data: currentStock, error: stockFetchError } = await adminClient
            .from('product_stock')
            .select('id, stock_quantity')
            .eq('product_id', productId)
            .eq('size', size)
            .maybeSingle();

        if (stockFetchError) throw stockFetchError;

        const previousQuantity = currentStock?.stock_quantity ?? 0;
        const change = newQuantity - previousQuantity;

        if (change === 0) {
            return { success: true, message: "La cantidad no varió." };
        }

        let stockId = currentStock?.id;

        if (currentStock) {
            // Actualizar stock de la variante
            const { error: updateError } = await adminClient
                .from('product_stock')
                .update({
                    stock_quantity: newQuantity,
                    updated_at: new Date().toISOString()
                })
                .eq('id', currentStock.id);

            if (updateError) throw updateError;
        } else {
            // Insertar si no existía el registro para este talle
            const { data: inserted, error: insertError } = await adminClient
                .from('product_stock')
                .insert({
                    product_id: productId,
                    size,
                    stock_quantity: newQuantity,
                    sku: `PF-${productId.substring(0, 5)}-${size}`
                })
                .select('id')
                .single();

            if (insertError) throw insertError;
            stockId = inserted.id;
        }

        // Recalcular stock consolidado del producto
        const { data: allSizes } = await adminClient
            .from('product_stock')
            .select('stock_quantity')
            .eq('product_id', productId);

        const totalProductStock = (allSizes || []).reduce((acc, curr) => acc + curr.stock_quantity, 0);

        await adminClient
            .from('products')
            .update({ 
                stock: totalProductStock,
                updated_at: new Date().toISOString()
            })
            .eq('id', productId);

        // Registrar explícitamente en stock_movements
        await adminClient.from('stock_movements').insert({
            product_id: productId,
            product_stock_id: stockId,
            size,
            quantity_change: change,
            previous_stock: previousQuantity,
            new_stock: newQuantity,
            reason: reason || (change > 0 ? 'restock' : 'adjustment'),
            user_id: user.id,
            notes: notes || `Ajuste manual desde panel de inventario (${reason})`
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error en adjustStockVariant:", error);
        return { success: false, error: error.message };
    }
}

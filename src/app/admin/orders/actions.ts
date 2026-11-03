"use server";

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export interface OrderActionResponse {
    success: boolean;
    error?: string;
    warning?: string;
    message?: string;
}

export async function confirmOrderPayment(orderId: string): Promise<OrderActionResponse> {
    try {
        const supabase = await createClient();
        const adminClient = createAdminClient();

        // 1. Verificar autenticación y rol del administrador
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No autenticado");

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAuthorized = profile && ['admin', 'employee'].includes(profile.role);
        if (!isAuthorized) {
            const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
            const adminEmails = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase());
            if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
                throw new Error("No tienes permisos de administrador para confirmar pagos.");
            }
        }

        // 2. Obtener el pedido y sus artículos
        const { data: order, error: orderError } = await adminClient
            .from('orders')
            .select('id, status, customer_email, order_items(id, product_id, size, quantity, product_name)')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            throw new Error("Pedido no encontrado.");
        }

        if (order.status === 'paid') {
            return { success: true, message: "El pedido ya se encontraba marcado como pagado." };
        }

        // 3. Descontar stock atómicamente para cada artículo registrado
        const orderItems = order.order_items || [];
        const stockErrors: string[] = [];

        for (const item of orderItems) {
            if (item.product_id) {
                try {
                    const { error: rpcError } = await adminClient.rpc('decrement_stock', {
                        p_id: item.product_id,
                        p_size: item.size,
                        p_qty: item.quantity,
                        p_order_id: order.id,
                        p_reason: 'sale'
                    });

                    if (rpcError) {
                        stockErrors.push(`Error en "${item.product_name || item.product_id}" (${item.size}): ${rpcError.message}`);
                    }
                } catch (stockEx: any) {
                    stockErrors.push(`Excepción descontando stock: ${stockEx.message}`);
                }
            }
        }

        // 4. Actualizar estado a 'paid'
        const { error: updateError } = await adminClient
            .from('orders')
            .update({ 
                status: 'paid',
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (updateError) throw updateError;

        // 5. Registrar en el historial de pedidos
        const historyNotes = stockErrors.length > 0
            ? `Pago confirmado manualmente. Advertencia de stock: ${stockErrors.join('; ')}`
            : `Pago confirmado manualmente por ${profile?.role || 'admin'}. Stock descontado automáticamente.`;

        await adminClient.from('order_history').insert({
            order_id: orderId,
            status: 'paid',
            notes: historyNotes
        });

        return { 
            success: true, 
            warning: stockErrors.length > 0 ? stockErrors.join('. ') : undefined 
        };

    } catch (error: any) {
        console.error("Error confirmando pago de pedido:", error);
        return { success: false, error: error.message || "Error al confirmar pago" };
    }
}

export async function updateAdminOrderStatus(orderId: string, newStatus: string): Promise<OrderActionResponse> {
    try {
        if (newStatus === 'paid') {
            return await confirmOrderPayment(orderId);
        }

        const supabase = await createClient();
        const adminClient = createAdminClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) throw new Error("No autenticado");

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAuthorized = profile && ['admin', 'employee'].includes(profile.role);
        if (!isAuthorized) {
            const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
            const adminEmails = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase());
            if (!adminEmails.includes(user.email.toLowerCase())) {
                throw new Error("No tienes permisos de administrador para modificar pedidos.");
            }
        }

        const { error } = await adminClient
            .from('orders')
            .update({ 
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;

        await adminClient.from('order_history').insert({
            order_id: orderId,
            status: newStatus,
            notes: `Estado actualizado a "${newStatus}" desde el panel de administración.`
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error actualizando estado de pedido:", error);
        return { success: false, error: error.message || "Error al actualizar estado" };
    }
}

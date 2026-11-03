import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cartValidateLimiter } from "@/utils/rateLimit";

interface IncomingCartItem {
    productId: string;
    size: string;
    quantity: number;
    price?: number;
}

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const { success: rateLimitOk } = await cartValidateLimiter.limit(`cart_${ip}`);
        if (!rateLimitOk) {
            return NextResponse.json({ error: "Demasiadas consultas de validación. Por favor aguardá unos segundos." }, { status: 429 });
        }

        const body = await req.json();
        const items: IncomingCartItem[] = body.items || [];

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({
                valid: true,
                hasAdjustments: false,
                items: [],
                warnings: [],
                totalPrice: 0
            });
        }

        const supabase = await createClient();
        const productIds = Array.from(new Set(items.map(i => i.productId).filter(Boolean)));

        // 1. Fetch live products from DB
        const { data: dbProducts, error: productsError } = await supabase
            .from('products')
            .select('id, name, price, stock, active, images, category, department')
            .in('id', productIds);

        if (productsError) {
            console.error("Error fetching products for cart validation:", productsError);
            return NextResponse.json({ error: "Error al consultar productos" }, { status: 500 });
        }

        // 2. Fetch live stock per variant from product_stock
        const { data: dbStockVariants, error: stockError } = await supabase
            .from('product_stock')
            .select('product_id, size, stock_quantity')
            .in('product_id', productIds);

        if (stockError) {
            console.warn("Could not fetch product_stock variants:", stockError);
        }

        const productMap = new Map<string, any>();
        (dbProducts || []).forEach(p => productMap.set(p.id, p));

        const stockMap = new Map<string, number>();
        (dbStockVariants || []).forEach(s => {
            stockMap.set(`${s.product_id}-${s.size}`, s.stock_quantity);
        });

        const validatedItems = [];
        const warnings: string[] = [];
        let hasAdjustments = false;
        let totalPrice = 0;

        for (const item of items) {
            const product = productMap.get(item.productId);

            // Check if product exists and is active
            if (!product || product.active === false) {
                warnings.push(`El producto "${product?.name || item.productId}" ya no se encuentra disponible y fue removido.`);
                hasAdjustments = true;
                continue;
            }

            // Determine stock for requested size
            const stockKey = `${item.productId}-${item.size}`;
            let maxStock: number;

            if (stockMap.has(stockKey)) {
                maxStock = stockMap.get(stockKey)!;
            } else {
                maxStock = product.stock ?? 0;
            }

            const currentPrice = Number(product.price);
            let finalQty = item.quantity;
            let itemWarning: string | null = null;
            let isOutOfStock = false;

            // Check price change
            if (item.price !== undefined && Math.abs(Number(item.price) - currentPrice) > 0.01) {
                warnings.push(`El precio de "${product.name}" se actualizó a $${currentPrice.toLocaleString("es-AR")}.`);
                hasAdjustments = true;
            }

            // Check stock availability
            if (maxStock <= 0) {
                isOutOfStock = true;
                itemWarning = `Agotado en talle ${item.size}.`;
                warnings.push(`"${product.name}" (${item.size}) se quedó sin stock.`);
                hasAdjustments = true;
            } else if (finalQty > maxStock) {
                finalQty = maxStock;
                itemWarning = `Cantidad ajustada a ${maxStock} por stock disponible.`;
                warnings.push(`Ajustamos la cantidad de "${product.name}" (${item.size}) a ${maxStock} por límite de stock.`);
                hasAdjustments = true;
            }

            if (!isOutOfStock) {
                totalPrice += currentPrice * finalQty;
            }

            validatedItems.push({
                productId: product.id,
                size: item.size,
                quantity: finalQty,
                availableStock: maxStock,
                isOutOfStock,
                warning: itemWarning,
                product: {
                    id: product.id,
                    name: product.name,
                    price: currentPrice,
                    stock: product.stock,
                    active: product.active,
                    images: product.images,
                    category: product.category,
                    department: product.department
                }
            });
        }

        const isValid = !hasAdjustments && validatedItems.every(i => !i.isOutOfStock);

        return NextResponse.json({
            valid: isValid,
            hasAdjustments,
            items: validatedItems,
            warnings,
            totalPrice
        });
    } catch (error: any) {
        console.error("Cart validation error:", error);
        return NextResponse.json({ error: error.message || "Error al validar carrito" }, { status: 500 });
    }
}


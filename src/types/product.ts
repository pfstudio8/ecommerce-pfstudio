export interface ProductStock {
    id?: string;
    product_id?: string;
    size: string;
    stock_quantity: number;
    sku?: string;
    // Keep quantity for backwards compatibility if some components still use it, but mark it optional
    quantity?: number;
}

export interface StockMovement {
    id: string;
    product_id: string;
    product_stock_id?: string;
    size?: string;
    quantity_change: number;
    previous_stock: number;
    new_stock: number;
    reason: 'sale' | 'restock' | 'adjustment' | 'cancellation' | 'return' | 'manual';
    user_id?: string;
    order_id?: string;
    notes?: string;
    created_at: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    image_url: string;
    hover_image_url?: string;
    images?: string[];
    is_new?: boolean;
    isNew?: boolean;
    department?: string;
    stock?: number;
    active?: boolean;
    stock_levels?: ProductStock[]; // Keep for backwards compatibility
    product_stock?: ProductStock[]; // From Supabase
}

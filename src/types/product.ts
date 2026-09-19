export interface ProductStock {
    size: string;
    stock_quantity: number;
    // Keep quantity for backwards compatibility if some components still use it, but mark it optional
    quantity?: number;
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
    stock_levels?: ProductStock[]; // Keep for backwards compatibility
    product_stock?: ProductStock[]; // From Supabase
}

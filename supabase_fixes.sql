-- 1. Agregar restricción UNIQUE a las reseñas para evitar spam
ALTER TABLE public.reviews
ADD CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id);

-- 2. Asegurar las funciones SECURITY DEFINER contra ataques de search path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.admin_users 
        WHERE email = coalesce(auth.jwt() ->> 'email', '')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.decrement_stock(p_id uuid, p_size text, p_qty int)
RETURNS void AS $$
BEGIN
    -- 1. Descontar del stock específico de la talla (product_stock)
    UPDATE public.product_stock
    SET stock_quantity = stock_quantity - p_qty
    WHERE product_id = p_id AND size = p_size AND stock_quantity >= p_qty;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'INSUFFICIENT_STOCK: No hay suficiente stock para el producto % talle %', p_id, p_size;
    END IF;

    -- 2. Descontar del stock consolidado heredado (products)
    UPDATE public.products
    SET stock = stock - p_qty
    WHERE id = p_id AND stock >= p_qty;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'INSUFFICIENT_STOCK: No hay suficiente stock total para el producto %', p_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

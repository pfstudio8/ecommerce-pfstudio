import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Checking orders...");
    const { data: orders, error: ordersError } = await supabase.from('orders').select('*').limit(5);
    if (ordersError) {
        console.error("Orders Error:", ordersError);
    } else {
        console.log("Orders:", orders);
    }

    console.log("\nChecking order_items...");
    const { data: items, error: itemsError } = await supabase.from('order_items').select('*').limit(5);
    if (itemsError) {
        console.error("Order Items Error:", itemsError);
    } else {
        console.log("Order Items:", items);
    }
}

main();

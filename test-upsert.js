import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpsert() {
    const stockEntries = [
        {
            product_id: 'f8463a35-764f-4921-a051-6ccd311c259f',
            size: 'S',
            stock_quantity: 2,
            sku: 'PF-f8463-S'
        }
    ];

    const { data, error } = await supabase
        .from('product_stock')
        .upsert(stockEntries, { onConflict: 'product_id, size' });

    console.log("Error:", error);
    console.log("Error JSON:", JSON.stringify(error, null, 2));
    console.log("Data:", data);
}

testUpsert();

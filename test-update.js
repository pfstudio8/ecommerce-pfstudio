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

async function testUpdate() {
    const { data, error } = await supabase
        .from('products')
        .update({
            name: "Remera Boxy Fit",
            price: 17000,
            category: "Boxy Fit",
            isNew: true,
            stock: 0
        })
        .eq('id', 'f8463a35-764f-4921-a051-6ccd311c259f');

    console.log("Error:", JSON.stringify(error, null, 2));
    console.log("Data:", data);
}

testUpdate();

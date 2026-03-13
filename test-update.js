import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zrwogbouarapcxzsqwan.supabase.co';
const supabaseKey = 'sb_publishable_6gx2sXBn05tXWe0rRsjUcg_weuelOel';
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

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newCategories = [
    { name: 'Camisetas', description: 'Camisetas de fútbol y de colección' },
    { name: 'Tazas', description: 'Tazas personalizadas y de cerámica' },
    { name: 'Encendedores', description: 'Encendedores de colección y utilidades' }
];

async function seedCategories() {
    console.log("Seeding categories into Supabase...");
    
    for (const cat of newCategories) {
        const { data, error } = await supabase
            .from('categories')
            .upsert(cat, { onConflict: 'name' })
            .select();
            
        if (error) {
            console.error(`Error inserting category ${cat.name}:`, error.message);
        } else {
            console.log(`Successfully seeded/updated category: ${cat.name}`);
        }
    }
    
    console.log("Seeding complete!");
}

seedCategories();

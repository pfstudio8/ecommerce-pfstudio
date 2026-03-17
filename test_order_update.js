const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zrwogbouarapcxzsqwan.supabase.co';
const supabaseKey = 'sb_publishable_6gx2sXBn05tXWe0rRsjUcg_weuelOel';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching one order to check its current status...");
  const { data, error } = await supabase.from('orders').select('id, status').limit(1);
  
  if (error) {
    console.error('Fetch Error:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log("No orders found.");
    return;
  }

  const orderId = data[0].id;
  const currentStatus = data[0].status;
  console.log(`Order ${orderId} has status: "${currentStatus}"`);

  console.log("Attempting to update status to 'shipped' (assuming typical frontend behavior)...");
  
  const { data: updateData, error: updateError } = await supabase
    .from('orders')
    .update({ status: 'shipped' })
    .eq('id', orderId)
    .select(); // we strictly select to see if RLS blocks the returning rows

  if (updateError) {
    console.error('Update Error:', updateError);
  } else {
    console.log('Update Successful. Data returned:', updateData);
    if (!updateData || updateData.length === 0) {
         console.log('WARNING: Update claim success but returned 0 rows. This means RLS might be preventing the update for the anon key!');
    }
  }
}

main();

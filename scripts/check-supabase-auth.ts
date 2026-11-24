import { createAdminClient } from '../src/lib/supabase/admin';

async function main() {
  const supabase = createAdminClient();
  if (!supabase) {
    console.error('Failed to create Supabase admin client. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    return;
  }

  console.log('--- SUPABASE AUTH USERS ---');
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error fetching auth users:', authError);
  } else {
    console.log(`Found ${authData.users.length} users in Supabase Auth:`);
    for (const u of authData.users) {
      console.log(`- ID: ${u.id} | Email: ${u.email} | Confirmed: ${u.email_confirmed_at ? 'Yes' : 'No'} | Metadata:`, u.user_metadata);
    }
  }

  console.log('\n--- PROFILES TABLE ---');
  const { data: profiles, error: profError } = await supabase.from('profiles').select('*');
  if (profError) {
    console.error('Error fetching profiles:', profError);
  } else {
    console.log(`Found ${profiles?.length || 0} profiles:`);
    for (const p of profiles || []) {
      console.log(`- ID: ${p.id} | Email: ${p.email} | Role: ${p.role} | Full Name: ${p.full_name}`);
    }
  }

  console.log('\n--- CHECK IF platform_admins TABLE EXISTS ---');
  const { data: platformAdmins, error: paError } = await supabase.from('platform_admins').select('*');
  if (paError) {
    console.log('platform_admins table query error:', paError.message);
  } else {
    console.log(`platform_admins exists! Count: ${platformAdmins?.length || 0}`);
    console.log(platformAdmins);
  }
}

main().catch(console.error);

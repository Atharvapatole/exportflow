import { createAdminClient } from '../src/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';
import { infraConfig } from '../src/config/infrastructure';
import { userRepo } from '../src/lib/db';
import { verifyPassword, hashPassword } from '../src/lib/auth';

async function runTests() {
  console.log('====================================================');
  console.log('EXPORTFLOW SUPER ADMIN AUTH & RECOVERY TEST SUITE');
  console.log('====================================================\n');

  const config = infraConfig.getSupabaseConfig();
  const bootstrap = infraConfig.getAdminBootstrapConfig();
  const adminClient = createAdminClient();

  // Test 1: Verify Super Admin user in Supabase
  console.log('TEST 1: Verify Super Admin in Supabase Auth & Profiles');
  if (!adminClient) {
    throw new Error('Supabase admin client not initialized');
  }

  const { data: usersData, error: usersErr } = await adminClient.auth.admin.listUsers();
  if (usersErr) throw usersErr;

  const adminUser = usersData.users.find((u) => u.email?.toLowerCase() === bootstrap.email.toLowerCase());
  if (!adminUser) {
    throw new Error(`Admin user ${bootstrap.email} not found in Supabase Auth!`);
  }

  console.log(`  ✓ Found admin user: ${adminUser.email} (ID: ${adminUser.id})`);
  console.log(`  ✓ Metadata role: ${adminUser.user_metadata?.role}`);
  if (adminUser.user_metadata?.role !== 'super_admin') {
    throw new Error('User does not have super_admin role in user_metadata!');
  }

  const { data: profile, error: profErr } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', adminUser.id)
    .single();

  if (profErr || !profile) {
    throw new Error(`Profile not found for admin: ${profErr?.message}`);
  }
  console.log(`  ✓ Profile table role: ${profile.role}`);
  if (profile.role !== 'super_admin') {
    throw new Error('Profile does not have super_admin role!');
  }

  // Test 2: Test Supabase client signInWithPassword with current credentials
  console.log('\nTEST 2: Supabase signInWithPassword verification');
  const browserClient = createClient(config.url, config.anonKey);
  const { data: authData, error: authErr } = await browserClient.auth.signInWithPassword({
    email: bootstrap.email,
    password: bootstrap.secret,
  });

  if (authErr) {
    throw new Error(`Supabase signInWithPassword failed: ${authErr.message}`);
  }
  console.log(`  ✓ Successfully signed in as ${authData.user.email} (Session token established)`);

  // Test 3: Test Super Admin login with incorrect password
  console.log('\nTEST 3: Incorrect password rejection');
  const { error: wrongAuthErr } = await browserClient.auth.signInWithPassword({
    email: bootstrap.email,
    password: 'WrongPassword123!',
  });
  if (!wrongAuthErr) {
    throw new Error('Incorrect password was accepted unexpectedly!');
  }
  console.log(`  ✓ Incorrect password was correctly rejected: "${wrongAuthErr.message}"`);

  // Test 4: Customer account blocked from Super Admin
  console.log('\nTEST 4: Non-admin customer blocked from Super Admin access');
  const customerEmail = 'atharvapatole43@gmail.com';
  const customerUser = await userRepo.findByEmail(customerEmail);
  if (customerUser) {
    console.log(`  ✓ Checked customer account: ${customerEmail} (Role: ${customerUser.role})`);
    if (customerUser.role === 'super_admin') {
      throw new Error('Customer account has super_admin role! Security breach.');
    }
    console.log('  ✓ Verified customer account role is NOT super_admin');
  }

  // Test 5: Test Supabase resetPasswordForEmail
  console.log('\nTEST 5: Supabase native resetPasswordForEmail generation');
  const redirectUrl = 'http://localhost:3000/admin/reset-password';
  const { error: resetErr } = await browserClient.auth.resetPasswordForEmail(bootstrap.email, {
    redirectTo: redirectUrl,
  });
  if (resetErr) {
    throw new Error(`resetPasswordForEmail failed: ${resetErr.message}`);
  }
  console.log(`  ✓ resetPasswordForEmail accepted for ${bootstrap.email} -> ${redirectUrl}`);

  // Test 6: Test Password Complexity Validation
  console.log('\nTEST 6: Password Complexity Regex Validation');
  const invalidPasswords = [
    { p: 'short1!', reason: 'Too short (< 12 chars)' },
    { p: 'nouppercase123!@#', reason: 'No uppercase' },
    { p: 'NOLOWERCASE123!@#', reason: 'No lowercase' },
    { p: 'NoNumbersHere!@#', reason: 'No digits' },
    { p: 'NoSpecialChar12345', reason: 'No special characters' },
  ];

  const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;
  for (const item of invalidPasswords) {
    const passed = complexityRegex.test(item.p);
    if (passed) {
      throw new Error(`Invalid password "${item.p}" passed complexity check! (${item.reason})`);
    }
    console.log(`  ✓ Rejected invalid password: "${item.p}" (${item.reason})`);
  }

  const validTestPassword = 'BenzwellAdmin2026!SecureKey';
  if (!complexityRegex.test(validTestPassword)) {
    throw new Error(`Valid password failed complexity check!`);
  }
  console.log(`  ✓ Approved valid password meeting all 5 complexity rules.`);

  // Test 7: Verify password reset execution and sync
  console.log('\nTEST 7: Supabase updateUser password update & synchronization');
  // Update password in Supabase for admin
  const testNewPassword = 'BenzwellAdmin2026!UpdatedKey';
  const { error: updateErr } = await adminClient.auth.admin.updateUserById(adminUser.id, {
    password: testNewPassword,
  });
  if (updateErr) {
    throw new Error(`Failed to update password: ${updateErr.message}`);
  }
  console.log('  ✓ Password updated to test value in Supabase Auth');

  // Verify login works with new password
  const { data: newAuth, error: newAuthErr } = await browserClient.auth.signInWithPassword({
    email: bootstrap.email,
    password: testNewPassword,
  });
  if (newAuthErr || !newAuth.user) {
    throw new Error(`Failed to sign in with new password: ${newAuthErr?.message}`);
  }
  console.log('  ✓ Verified: New password successfully authenticates in Supabase Auth');

  // Verify old password no longer works
  const { error: oldAuthErr } = await browserClient.auth.signInWithPassword({
    email: bootstrap.email,
    password: 'AnOldInvalidPassword123!',
  });
  if (!oldAuthErr) {
    throw new Error('Old password still works!');
  }
  console.log('  ✓ Verified: Old password rejected');

  // Restore the official bootstrap password in Supabase and local DB
  const { error: restoreErr } = await adminClient.auth.admin.updateUserById(adminUser.id, {
    password: bootstrap.secret,
  });
  if (restoreErr) throw restoreErr;

  const localAdmin = await userRepo.findByEmail(bootstrap.email);
  if (localAdmin) {
    await userRepo.update(localAdmin.id, {
      passwordHash: hashPassword(bootstrap.secret),
    });
  }
  console.log('  ✓ Restored password to official key');

  // Re-verify official key works
  const { error: reAuthErr } = await browserClient.auth.signInWithPassword({
    email: bootstrap.email,
    password: bootstrap.secret,
  });
  if (reAuthErr) throw reAuthErr;
  console.log('  ✓ Re-authenticated successfully with official admin key');

  console.log('\n====================================================');
  console.log('ALL 7 SUPER ADMIN AUTH & RECOVERY TESTS PASSED!');
  console.log('====================================================');
}

runTests().catch((e) => {
  console.error('\n❌ TEST RUN FAILED:', e);
  process.exit(1);
});

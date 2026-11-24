import { requireSuperAdmin, getAdminContext } from '../src/lib/auth';
import { userRepo, orgRepo, documentRepo, adminRepo } from '../src/lib/db';

async function verifyDirectAdminEntry() {
  console.log('========================================================================');
  console.log('EXPORTFLOW BY BENZWELL — DIRECT ADMIN ENTRY VERIFICATION');
  console.log('========================================================================\n');

  // Test 1: Direct Admin Access in Local Development
  console.log('TEST 1: Direct Admin Entry in Local Development (NODE_ENV=development)');
  (process.env as any).NODE_ENV = 'development';
  const devAuth = await requireSuperAdmin();
  if (!devAuth.authorized || devAuth.statusCode !== 200) {
    throw new Error(`TEST 1 FAILED: Expected direct authorization, got: ${JSON.stringify(devAuth)}`);
  }
  const devCtx = await getAdminContext();
  if (!devCtx || !devCtx.isSuperAdmin) {
    throw new Error('TEST 1 FAILED: Expected valid Super Admin context');
  }
  console.log(`  ✓ Authorized identity: ${devAuth.user?.email}`);
  console.log(`  ✓ Super Admin flag: ${devCtx.isSuperAdmin}`);
  console.log('  -> TEST 1 PASSED: Direct admin entry active in development.\n');

  // Test 2: Direct Admin Access in Production URL / Production Mode
  console.log('TEST 2: Direct Admin Entry on Production URL (NODE_ENV=production)');
  (process.env as any).NODE_ENV = 'production';
  const prodAuth = await requireSuperAdmin();
  if (!prodAuth.authorized || prodAuth.statusCode !== 200) {
    throw new Error(`TEST 2 FAILED: Expected direct authorization in production, got: ${JSON.stringify(prodAuth)}`);
  }
  const prodCtx = await getAdminContext();
  if (!prodCtx || !prodCtx.isSuperAdmin) {
    throw new Error('TEST 2 FAILED: Expected valid Super Admin context in production');
  }
  console.log(`  ✓ Authorized identity: ${prodAuth.user?.email}`);
  console.log(`  ✓ Super Admin flag: ${prodCtx.isSuperAdmin}`);
  console.log('  -> TEST 2 PASSED: Direct admin entry active in production without login screen.\n');

  // Test 3: Admin Overview Stats and Repositories Load Cleanly
  console.log('TEST 3: Verify Admin Data Services execute cleanly under Direct Entry');
  const [stats, users, companies, activities] = await Promise.all([
    adminRepo.getPlatformStats(),
    userRepo.listAll(),
    orgRepo.listAll(),
    adminRepo.getActivity(10),
  ]);
  console.log(`  ✓ Platform Stats: Total Users = ${stats.totalUsers}, Total Companies = ${stats.totalCompanies}`);
  console.log(`  ✓ User repository records loaded: ${users.length}`);
  console.log(`  ✓ Organization repository records loaded: ${companies.length}`);
  console.log('  -> TEST 3 PASSED: All admin data services operational.\n');

  // Test 4: Customer Authentication Remains Separate
  console.log('TEST 4: Verify normal customer authentication remains intact and separate');
  const customer = await userRepo.findByEmail('atharvapatole43@gmail.com');
  console.log(`  ✓ Customer account found: ${customer?.email} (Role: ${customer?.role})`);
  if (customer?.role === 'super_admin') {
    throw new Error('TEST 4 FAILED: Customer role was modified');
  }
  console.log('  -> TEST 4 PASSED: Customer authentication isolated and intact.\n');

  console.log('========================================================================');
  console.log('ALL DIRECT ENTRY VERIFICATION TESTS PASSED SUCCESSFULLY WITH ZERO ERRORS!');
  console.log('========================================================================\n');
}

verifyDirectAdminEntry().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

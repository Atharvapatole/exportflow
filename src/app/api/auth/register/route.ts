import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userRepo, orgRepo, adminRepo } from '@/lib/db';
import { hashPassword, setSessionCookie, ensureSuperAdminInitialized } from '@/lib/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyName: z.string().min(2, 'Company name is required'),
  country: z.string().min(2, 'Country is required'),
});

export async function POST(req: NextRequest) {
  try {
    await ensureSuperAdminInitialized();
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: (result.error as any).issues?.[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { name, email, password, companyName, country } = result.data;
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await userRepo.findByEmail(cleanEmail);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // 1. Create User
    const newUser = await userRepo.create({
      name,
      email: cleanEmail,
      passwordHash: hashPassword(password),
      role: 'owner',
      status: 'active',
      lastActiveAt: new Date().toISOString(),
    });

    // 2. Create Organization, Membership & Company Profile
    const { organization } = await orgRepo.create(
      {
        name: companyName,
        businessType: 'Export Business',
        country,
        ownerId: newUser.id,
      },
      newUser.email,
      newUser.name
    );

    // 3. Update currentOrgId on user
    await userRepo.update(newUser.id, { currentOrgId: organization.id });

    // 4. Log Platform Activity
    await adminRepo.logActivity({
      userId: newUser.id,
      userName: newUser.name,
      organizationId: organization.id,
      action: 'USER_REGISTERED',
      entity: 'USER',
      entityId: newUser.id,
      details: `New company registered: ${companyName} (${country})`,
    });

    // 5. Establish secure session
    await setSessionCookie({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      orgId: organization.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      redirectUrl: '/onboarding',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}

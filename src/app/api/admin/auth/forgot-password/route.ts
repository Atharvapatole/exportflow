import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { infraConfig } from '@/config/infrastructure';
import { ensureSuperAdminInitialized } from '@/lib/auth';

const forgotPasswordSchema = z.object({
  email: z.string().email('Valid administrator email address is required'),
});

export const dynamic = 'force-dynamic';

// In-memory rate limiting map: ipOrEmail -> timestamps[]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 4;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(key, validTimestamps);
    return false; // Rate limit exceeded
  }

  validTimestamps.push(now);
  rateLimitMap.set(key, validTimestamps);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: (parsed.error as any).issues?.[0]?.message || 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const cleanEmail = email.trim().toLowerCase();

    // Rate limiting check by IP and email
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateKey = `${ip}:${cleanEmail}`;

    if (!checkRateLimit(rateKey)) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please wait 15 minutes before trying again.' },
        { status: 429 }
      );
    }

    // Make sure Super Admin exists in Supabase so Supabase Auth can deliver the email
    await ensureSuperAdminInitialized();

    const config = infraConfig.getSupabaseConfig();
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const redirectTo = `${appUrl}/admin/reset-password`;

    // Dispatch native Supabase Auth password recovery email
    if (config.isConfigured) {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo,
        });

        if (resetErr) {
          console.warn('[FORGOT PASSWORD] Supabase resetPasswordForEmail notice:', resetErr.message);
        } else {
          console.log(`[FORGOT PASSWORD] Recovery email requested for ${cleanEmail} -> redirect: ${redirectTo}`);
        }
      }
    } else {
      console.warn('[FORGOT PASSWORD] Supabase credentials not configured in environment.');
    }

    // Generic, non-enumerable confirmation message
    return NextResponse.json({
      success: true,
      message:
        'If an account exists for this email address, a password reset link will be sent shortly. Please check your inbox and spam folder.',
    });
  } catch (error: any) {
    console.error('Forgot password handler error:', error);
    return NextResponse.json(
      { error: error?.message || 'Unable to process recovery request.' },
      { status: 500 }
    );
  }
}

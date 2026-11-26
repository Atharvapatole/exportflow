import { NextRequest, NextResponse } from 'next/server';
import { apiKeyRepo, customsJobRepo } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const apiKeyHeader = req.headers.get('x-api-key');
    if (!apiKeyHeader) {
      return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401 });
    }

    const { valid, apiKey } = await apiKeyRepo.verifyKey(apiKeyHeader);
    if (!valid || !apiKey) {
      return NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 401 });
    }

    // Rate limiting & logging
    await apiKeyRepo.logUsage({
      apiKeyId: apiKey.id,
      orgId: apiKey.orgId,
      endpoint: '/api/v1/jobs',
      method: 'GET',
      statusCode: 200,
      responseTimeMs: 12,
    });

    const targetOrgId = apiKey.orgId || apiKey.organizationId || '';
    const jobs = await customsJobRepo.listByOrg(targetOrgId);
    return NextResponse.json({
      status: 'success',
      data: {
        total: jobs.length,
        jobs,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

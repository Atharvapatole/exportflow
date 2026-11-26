import { NextRequest, NextResponse } from 'next/server';
import { getCurrentContext } from '@/lib/auth';
import { chaClientRepo, customsJobRepo, chaDocRepo } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getCurrentContext();
    if (!ctx || !ctx.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = ctx.organization.id;
    const [clients, allJobs, allDocs] = await Promise.all([
      chaClientRepo.listByOrg(orgId),
      customsJobRepo.listByOrg(orgId),
      chaDocRepo.listByOrg(orgId),
    ]);

    const enrichedCustomers = clients.map((client) => {
      const clientJobs = allJobs.filter((j) => j.clientId === client.id);
      const clientDocs = allDocs.filter((d) => d.clientId === client.id);
      
      const latestDoc = clientDocs.length > 0 ? clientDocs[0] : null; // already sorted desc
      const activeJobs = clientJobs.filter(
        (j) => !['ooc_granted', 'leo_granted', 'completed', 'cancelled'].includes(j.status)
      );

      const totalDutyBilled = clientJobs.reduce((sum, j) => sum + (j.actualDutyPaidInr || j.estimatedDutyInr || 0), 0);
      const totalChaFees = clientJobs.reduce((sum, j) => sum + (j.chaChargesInr || 0), 0);

      return {
        ...client,
        iecNumber: client.iecNumber || '',
        totalJobsCount: clientJobs.length,
        activeJobsCount: activeJobs.length,
        totalDocumentsCount: clientDocs.length,
        totalDutyBilled,
        totalChaFees,
        latestDocument: latestDoc
          ? {
              id: latestDoc.id,
              title: latestDoc.documentTitle,
              number: latestDoc.documentNumber,
              type: latestDoc.type,
              status: latestDoc.status,
              createdAt: latestDoc.createdAt,
            }
          : null,
      };
    });

    return NextResponse.json({ customers: enrichedCustomers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

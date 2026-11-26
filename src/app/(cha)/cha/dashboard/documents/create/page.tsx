import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { chaClientRepo, customsJobRepo, signatureRepo } from '@/lib/db';
import { ChaDocumentCreator } from '@/components/cha/ChaDocumentCreator';

export const dynamic = 'force-dynamic';

export default async function CreateChaDocumentPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const ctx = await getCurrentContext();
  const orgId = ctx?.organization?.id || '';

  const [clients, jobs, signatures] = await Promise.all([
    chaClientRepo.listByOrg(orgId),
    customsJobRepo.listByOrg(orgId),
    signatureRepo.listByOrg(orgId),
  ]);

  const clientOptions = clients.map((c) => ({
    id: c.id,
    companyName: c.companyName,
    iecNumber: c.iecNumber || '',
    gstin: c.gstin,
    pan: c.pan,
    address: c.address,
    city: c.city,
    state: c.state,
    contactPerson: c.contactPerson,
    email: c.email,
  }));

  const jobOptions = jobs.map((j) => ({
    id: j.id,
    jobNumber: j.jobNumber,
    clientId: j.clientId,
    portCode: j.customsStation || j.customsHouseCode || 'INNSA1',
    jobType: (j.jobType === 'export' ? 'export' : 'import') as 'import' | 'export',
    blAwbNumber: j.blAwbNumber,
  }));

  const brokerFirmName = ctx?.organization?.name || 'Customs Brokerage Firm';
  const brokerLicenseNumber = ctx?.organization?.chaLicenseNumber || 'CHA-LIC-2024-REG10';
  const brokerStation = ctx?.organization?.chaLicenseAuthority || 'Nhava Sheva (INNSA1)';

  return (
    <div className="py-2">
      <ChaDocumentCreator
        clients={clientOptions}
        jobs={jobOptions}
        signatures={signatures}
        initialClientId={clientId}
        brokerFirmName={brokerFirmName}
        brokerLicenseNumber={brokerLicenseNumber}
        brokerStation={brokerStation}
      />
    </div>
  );
}

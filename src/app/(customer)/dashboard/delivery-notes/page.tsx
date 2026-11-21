import React from 'react';
import { getCurrentContext } from '@/lib/auth';
import { documentRepo } from '@/lib/db';
import { Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';

export default async function DeliveryNotesListPage() {
  const ctx = await getCurrentContext();
  if (!ctx || !ctx.organization) return null;

  const docs = await documentRepo.listByOrg(ctx.organization.id, 'delivery_note');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#172033] tracking-tight">Delivery Notes / Goods Dispatch Vouchers</h1>
        <p className="text-xs text-[#64748B]">Driver hand-over proofs and inland transport dispatch notes</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {docs.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No Delivery Notes generated yet"
              description="Convert a Commercial Invoice or Packing list into a driver delivery note when handing cargo to the container freight station."
              actionLabel="View Packing Lists"
              actionHref="/dashboard/packing-lists"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[#64748B] font-semibold">
                    <th className="py-3 px-4">Note Number</th>
                    <th className="py-3 px-4">Consignee</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docs.map((doc) => (
                    <tr key={doc.id}>
                      <td className="py-3 px-4 font-bold">{doc.documentNumber}</td>
                      <td className="py-3 px-4">{doc.buyerCompany}</td>
                      <td className="py-3 px-4">{formatDate(doc.date)}</td>
                      <td className="py-3 px-4">{doc.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

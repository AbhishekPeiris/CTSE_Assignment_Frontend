import React from 'react';
import StatusPill from "../../../components/ui/StatusPill";
import { formatDate, resolveEntityId } from "../../../utils/helpers";

export default function MyActivityTable({ deliveries }) {
  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="col-span-full rounded-2xl border border-slate-200 bg-white py-16 text-center">
        <p className="text-sm font-medium text-slate-500">No past activity recorded for today.</p>
      </div>
    );
  }

  return (
    <div className="col-span-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50">
            <tr>
              <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">Order ID</th>
              <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">Destination</th>
              <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">Assigned Date</th>
              <th className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deliveries.map((delivery) => {
              const id = resolveEntityId(delivery);
              const status = String(delivery?.status || "ASSIGNED").toUpperCase();
              return (
                <tr key={id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      #{String(delivery.orderId).substring(0,8)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {delivery?.deliveryLocation?.address || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {formatDate(delivery.assignedAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <StatusPill status={status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

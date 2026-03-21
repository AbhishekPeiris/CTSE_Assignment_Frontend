import React from 'react';
import StatusPill from "../../../components/ui/StatusPill";
import { formatDate, resolveEntityId } from "../../../utils/helpers";

export default function MyActivityTable({ deliveries }) {
  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="col-span-full flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16">
        <p className="text-sm text-slate-400">No past activity recorded for today.</p>
      </div>
    );
  }

  return (
    <div className="col-span-full overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-white px-5 py-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Activity Log</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{deliveries.length} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Order ID</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Destination</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Date</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deliveries.map((delivery) => {
              const id = resolveEntityId(delivery);
              const status = String(delivery?.status || "ASSIGNED").toUpperCase();
              return (
                <tr key={id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-500">
                      #{String(delivery.orderId).substring(0, 8)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-700">
                    {delivery?.deliveryLocation?.address || "N/A"}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {formatDate(delivery.assignedAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
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

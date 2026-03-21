import React from 'react';
import StatusPill from "../../../components/ui/StatusPill";
import { formatDate, resolveEntityId } from "../../../utils/helpers";

export default function MyActivityTable({ deliveries }) {
  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="col-span-full flex items-center justify-center rounded-[28px] border border-dashed border-[#ddd4c7] bg-[#fcfaf6] py-16">
        <p className="text-sm text-[#8b95a7]">No past activity recorded for today.</p>
      </div>
    );
  }

  return (
    <div className="col-span-full overflow-hidden rounded-[28px] border border-[#ece6dc] bg-[#fffdfa]">
      {/* Header */}
      <div className="border-b border-[#efeae2] bg-[#fcfaf6] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">History</p>
          <h3 className="mt-0.5 text-base font-semibold text-[#111827]">My Activity Log</h3>
        </div>
        <span className="rounded-2xl border border-[#e4ddd2] bg-white px-3 py-1 text-xs font-semibold text-[#6b7280]">
          {deliveries.length} records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-[#fdfaf5] border-b border-[#efeae2]">
            <tr>
              <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">Order ID</th>
              <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">Destination</th>
              <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">Date</th>
              <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8f7a] text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ebe3]">
            {deliveries.map((delivery) => {
              const id = resolveEntityId(delivery);
              const status = String(delivery?.status || "ASSIGNED").toUpperCase();
              return (
                <tr key={id} className="transition-colors hover:bg-[#fdfaf5]">
                  <td className="px-6 py-4">
                    <span className="rounded-xl border border-[#e4ddd2] bg-white px-2.5 py-1 text-[11px] font-mono text-[#6b7280]">
                      #{String(delivery.orderId).substring(0, 8)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[#374151]">
                    {delivery?.deliveryLocation?.address || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-xs text-[#8b95a7]">
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

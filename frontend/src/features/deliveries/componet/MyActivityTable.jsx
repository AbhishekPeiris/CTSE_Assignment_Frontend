import React from 'react';
import StatusPill from "../../../components/ui/StatusPill";
import { formatDate, resolveEntityId } from "../../../utils/helpers";

const PRIORITY_DOT = {
  URGENT: "bg-rose-500",
  HIGH:   "bg-amber-400",
  NORMAL: "bg-slate-300",
};

const PRIORITY_LABEL = {
  URGENT: { text: "Urgent",  cls: "text-rose-600 bg-rose-50 border-rose-200" },
  HIGH:   { text: "High",    cls: "text-amber-600 bg-amber-50 border-amber-200" },
  NORMAL: { text: "Normal",  cls: "text-[#6b7280] bg-slate-50 border-slate-200" },
};

const STATUS_ICON = {
  COMPLETED:             { bg: "bg-[#f3fbf5] border-[#c6e6d0]", dot: "bg-emerald-500" },
  CANCELLED_BY_DELIVERY: { bg: "bg-rose-50 border-rose-200",    dot: "bg-rose-500" },
  FAILED:                { bg: "bg-rose-50 border-rose-200",    dot: "bg-rose-500" },
  RETURNED:              { bg: "bg-amber-50 border-amber-200",  dot: "bg-amber-400" },
};

function IconBox({ children }) {
  return (
    <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl border border-[#ece6dc] bg-[#fdfaf5] text-[#9a8f7a]">
      {children}
    </span>
  );
}

export default function MyActivityTable({ deliveries }) {
  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-[#ddd4c7] bg-[#fcfaf6] py-16">
        <span className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[#e4ddd2] bg-white text-2xl">📋</span>
        <p className="text-sm text-[#8b95a7]">No past activity recorded for today.</p>
      </div>
    );
  }

  return (
    <div className="col-span-full space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">History</p>
          <h3 className="mt-0.5 text-base font-semibold text-[#111827]">My Activity Log</h3>
        </div>
        <span className="rounded-2xl border border-[#e4ddd2] bg-white px-3 py-1 text-xs font-semibold text-[#6b7280]">
          {deliveries.length} {deliveries.length === 1 ? "record" : "records"}
        </span>
      </div>

      {/* Cards */}
      {deliveries.map((delivery) => {
        const id = resolveEntityId(delivery);
        const status = String(delivery?.status || "ASSIGNED").toUpperCase();
        const priorityKey = String(delivery?.priority || "NORMAL").toUpperCase();
        const priorityCfg  = PRIORITY_LABEL[priorityKey] || PRIORITY_LABEL.NORMAL;
        const statusStyle  = STATUS_ICON[status] || { bg: "bg-[#f9fbff] border-[#e5edf8]", dot: "bg-slate-400" };
        const hasFailure   = !!delivery.failureReason;
        const isOverdue    = delivery.estimatedDeliveryTime && status !== "COMPLETED" &&
                             new Date(delivery.estimatedDeliveryTime) < new Date();

        return (
          <div
            key={id}
            className="overflow-hidden rounded-[24px] border border-[#ece6dc] bg-[#fffdfa]"
          >
            {/* Top row: order ID + priority + status */}
            <div className="flex items-center justify-between border-b border-[#efeae2] bg-[#fcfaf6] px-5 py-3.5">
              <div className="flex items-center gap-3">
                {/* Status indicator dot */}
                <span className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border ${statusStyle.bg}`}>
                  <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a8f7a]">Order</p>
                  <p className="font-mono text-xs font-semibold text-[#374151]">
                    #{String(delivery.orderId || id).substring(0, 10).toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {priorityKey !== "NORMAL" && (
                  <span className={`rounded-xl border px-2.5 py-1 text-[10px] font-semibold ${priorityCfg.cls}`}>
                    <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle ${PRIORITY_DOT[priorityKey]}`} />
                    {priorityCfg.text}
                  </span>
                )}
                <StatusPill status={status} />
              </div>
            </div>

            {/* Details */}
            <div className="divide-y divide-[#f5f0ea] px-5">

              {/* Address */}
              {delivery?.deliveryLocation?.address && (
                <div className="flex items-start gap-3 py-3">
                  <IconBox>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </IconBox>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a8f7a]">Destination</p>
                    <p className="mt-0.5 text-xs font-medium text-[#374151] leading-snug">
                      {delivery.deliveryLocation.address}
                    </p>
                  </div>
                </div>
              )}

              {/* Times row */}
              <div className="flex items-center gap-6 py-3">
                {/* Assigned at */}
                <div className="flex items-center gap-2.5">
                  <IconBox>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </IconBox>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a8f7a]">Assigned</p>
                    <p className="mt-0.5 text-xs text-[#374151]">{formatDate(delivery.assignedAt)}</p>
                  </div>
                </div>

                {/* Est. delivery */}
                {delivery.estimatedDeliveryTime && (
                  <div className="flex items-center gap-2.5">
                    <IconBox>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </IconBox>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a8f7a]">Est. Delivery</p>
                      <p className={`mt-0.5 text-xs ${isOverdue ? "text-rose-600 font-semibold" : "text-[#374151]"}`}>
                        {isOverdue && <span className="mr-1">⚠</span>}
                        {formatDate(delivery.estimatedDeliveryTime)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Picked up at (if present) */}
              {delivery.pickedUpAt && (
                <div className="flex items-center gap-2.5 py-3">
                  <IconBox>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </IconBox>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a8f7a]">Picked Up</p>
                    <p className="mt-0.5 text-xs text-[#374151]">{formatDate(delivery.pickedUpAt)}</p>
                  </div>
                </div>
              )}

              {/* Notes (if present) */}
              {delivery.notes && (
                <div className="flex items-start gap-2.5 py-3">
                  <IconBox>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </IconBox>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a8f7a]">Notes</p>
                    <p className="mt-0.5 text-xs text-[#374151] leading-snug">{delivery.notes}</p>
                  </div>
                </div>
              )}

              {/* Failure reason (if cancelled) */}
              {hasFailure && (
                <div className="py-3">
                  <div className="rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-rose-600">Failure Reason</p>
                    </div>
                    <p className="text-xs text-rose-700 leading-snug">{delivery.failureReason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import React, { useState } from 'react';
import StatusPill from "../../../components/ui/StatusPill";
import { formatDate, resolveEntityId } from "../../../utils/helpers";

/* ── Status progress flow ─────────────────────────────── */
const STATUS_FLOW = ["ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "COMPLETED"];

const STATUS_FLOW_LABELS = {
  ASSIGNED:        "Assigned",
  PICKED_UP:       "Picked Up",
  OUT_FOR_DELIVERY:"En Route",
  COMPLETED:       "Delivered",
};

/* ── Priority styles ──────────────────────────────────── */
const PRIORITY_BADGE = {
  URGENT: { cls: "bg-rose-50 text-rose-700 border-rose-200",   dot: "bg-rose-500" },
  HIGH:   { cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  NORMAL: { cls: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" },
};

/* ── Action buttons ───────────────────────────────────── */
const DELIVERY_ACTIONS = [
  { status: "PICKED_UP",             label: "Mark Picked Up",  icon: "📦", tone: "bg-[#1d4ed8] hover:bg-[#1e40af] text-white border-transparent" },
  { status: "OUT_FOR_DELIVERY",      label: "Out for Delivery", icon: "🚚", tone: "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent" },
  { status: "COMPLETED",             label: "Mark Delivered",   icon: "✅", tone: "bg-[#15803d] hover:bg-[#166534] text-white border-transparent" },
  { status: "CANCELLED_BY_DELIVERY", label: "Cancel / Issue",   icon: "⚠️", tone: "border border-[#fecaca] bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#b91c1c]" },
];

/* ── Small icon-row helper ────────────────────────────── */
function InfoRow({ icon, label, children, highlight }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#ece6dc] bg-[#fdfaf5] text-[#9a8f7a]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8f7a]">{label}</p>
        <div className={`mt-0.5 text-sm font-medium leading-snug ${highlight || "text-[#374151]"}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Progress stepper ─────────────────────────────────── */
function StatusStepper({ currentStatus }) {
  const currentIdx = STATUS_FLOW.indexOf(currentStatus);
  return (
    <div className="flex items-center gap-0 w-full mt-4 mb-1">
      {STATUS_FLOW.map((step, i) => {
        const done    = i <= currentIdx;
        const current = i === currentIdx;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                done
                  ? "border-[#1d4ed8] bg-[#1d4ed8]"
                  : "border-[#ddd4c7] bg-white"
              }`}>
                {done && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <p className={`text-[9px] font-semibold uppercase tracking-wide text-center whitespace-nowrap ${
                current ? "text-[#1d4ed8]" : done ? "text-[#6b7280]" : "text-[#c4bfb7]"
              }`}>
                {STATUS_FLOW_LABELS[step]}
              </p>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${
                i < currentIdx ? "bg-[#1d4ed8]" : "bg-[#ece6dc]"
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Main card ────────────────────────────────────────── */
export default function UpcomingTaskCard({ delivery, note, onNoteChange, onUpdateStatus, actionLoading, onTrackMap }) {
  const id          = resolveEntityId(delivery);
  const status      = String(delivery?.status || "ASSIGNED").toUpperCase();
  const priorityKey = (delivery?.priority || "NORMAL").toUpperCase();
  const pBadge      = PRIORITY_BADGE[priorityKey] || PRIORITY_BADGE.NORMAL;

  const isOverdue = delivery?.estimatedDeliveryTime && new Date(delivery.estimatedDeliveryTime) < new Date();

  const [failureReason,   setFailureReason]   = useState("");
  const [showCancelInput, setShowCancelInput] = useState(false);

  const handleAction = (actionStatus) => {
    if (actionStatus === "CANCELLED_BY_DELIVERY" && !showCancelInput) {
      setShowCancelInput(true);
      return;
    }
    onUpdateStatus(id, actionStatus, failureReason || undefined);
    setShowCancelInput(false);
    setFailureReason("");
  };

  return (
    <article className="flex flex-col rounded-[28px] border border-[#ece6dc] bg-[#fffdfa] overflow-hidden transition hover:border-[#dccdb7]">

      {/* ── Card header ── */}
      <div className="border-b border-[#efeae2] bg-[#fcfaf6] px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          {/* Order ID */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">Delivery Order</p>
            <h2 className="mt-0.5 text-base font-bold tracking-[-0.01em] text-[#111827]">
              #{String(delivery?.orderId).substring(0, 10)}
            </h2>
          </div>
          {/* Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            {priorityKey !== "NORMAL" && (
              <span className={`flex items-center gap-1 rounded-xl border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${pBadge.cls}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${pBadge.dot}`} />
                {priorityKey}
              </span>
            )}
            <StatusPill status={status} />
          </div>
        </div>

        {/* Progress stepper */}
        {!["COMPLETED", "CANCELLED_BY_DELIVERY"].includes(status) && (
          <StatusStepper currentStatus={status} />
        )}
      </div>

      {/* ── Detail rows ── */}
      <div className="px-5 py-4 space-y-3.5">

        {/* Phone */}
        <InfoRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }
          label="Customer Contact"
        >
          {delivery?.customerContactNumber || "Not provided"}
        </InfoRow>

        {/* Destination */}
        <InfoRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label="Delivery Address"
        >
          <span className="leading-relaxed">{delivery?.deliveryLocation?.address || "Address not provided"}</span>
          {delivery?.deliveryLocation?.latitude && delivery?.deliveryLocation?.longitude && (
            <span className="mt-1 block text-[11px] text-[#8b95a7]">
              {delivery.deliveryLocation.latitude.toFixed(5)}, {delivery.deliveryLocation.longitude.toFixed(5)}
            </span>
          )}
        </InfoRow>

        {/* Assigned at */}
        <InfoRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Assigned At"
        >
          {formatDate(delivery?.assignedAt)}
        </InfoRow>

        {/* Estimated delivery */}
        {delivery?.estimatedDeliveryTime && (
          <InfoRow
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            label="Est. Delivery"
            highlight={isOverdue ? "text-rose-600 font-semibold" : "text-[#15803d] font-semibold"}
          >
            {isOverdue && <span className="mr-1 text-[10px] font-bold uppercase tracking-wide">⚠ Overdue —</span>}
            {formatDate(delivery.estimatedDeliveryTime)}
          </InfoRow>
        )}

        {/* Picked up at */}
        {delivery?.pickedUpAt && (
          <InfoRow
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            }
            label="Picked Up At"
            highlight="text-[#1d4ed8]"
          >
            {formatDate(delivery.pickedUpAt)}
          </InfoRow>
        )}

        {/* Notes */}
        {delivery?.notes && (
          <InfoRow
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            label="Shipment Notes"
            highlight="text-[#6b7280] italic"
          >
            "{delivery.notes}"
          </InfoRow>
        )}

        {/* Navigate button */}
        {delivery?.deliveryLocation?.latitude && delivery?.deliveryLocation?.longitude && (
          <button
            type="button"
            onClick={() => onTrackMap(id)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e5edf8] bg-[#f9fbff] px-4 py-2.5 text-xs font-semibold text-[#1d4ed8] transition hover:bg-[#1d4ed8] hover:text-white hover:border-[#1d4ed8]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            View on Map &amp; Navigate
          </button>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="border-t border-[#efeae2] bg-[#fcfaf6] px-5 py-4 space-y-3">

        {/* Tracking note */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#ece6dc] bg-white text-[#9a8f7a]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <input
            type="text"
            value={note || ""}
            onChange={(e) => onNoteChange(id, e.target.value)}
            placeholder="Add a tracking note..."
            className="w-full rounded-2xl border border-[#e4ddd2] bg-white px-3 py-2 text-xs text-[#111827] outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 placeholder:text-[#c4bfb7]"
          />
        </div>

        {/* Cancel reason */}
        {showCancelInput && (
          <div className="rounded-[22px] border border-[#fecaca] bg-[#fff1f2] p-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b91c1c]">Cancellation Reason</p>
            <textarea
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              rows={2}
              placeholder="e.g. Customer not available, wrong address..."
              className="w-full resize-none rounded-xl border border-[#fecaca] bg-white px-3 py-2 text-xs text-[#111827] outline-none focus:border-[#b91c1c] placeholder:text-[#c4bfb7]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAction("CANCELLED_BY_DELIVERY")}
                disabled={actionLoading === `${id}:CANCELLED_BY_DELIVERY`}
                className="flex-1 rounded-xl border border-[#fecaca] bg-[#fff1f2] hover:bg-[#ffe4e6] px-3 py-2 text-xs font-semibold text-[#b91c1c] transition disabled:opacity-40"
              >
                {actionLoading === `${id}:CANCELLED_BY_DELIVERY` ? "Cancelling..." : "Confirm Cancel"}
              </button>
              <button
                type="button"
                onClick={() => { setShowCancelInput(false); setFailureReason(""); }}
                className="rounded-xl border border-[#e4ddd2] bg-white px-3 py-2 text-xs font-semibold text-[#6b7280] transition hover:bg-[#f5f0ea]"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!showCancelInput && (
          <div className="grid grid-cols-2 gap-2">
            {DELIVERY_ACTIONS.map((action) => (
              <button
                key={action.status}
                type="button"
                disabled={actionLoading === `${id}:${action.status}` || status === action.status}
                onClick={() => handleAction(action.status)}
                className={`flex items-center justify-center gap-1.5 rounded-2xl border px-2 py-2.5 text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${action.tone}`}
              >
                <span>{action.icon}</span>
                {actionLoading === `${id}:${action.status}` ? "Updating..." : action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

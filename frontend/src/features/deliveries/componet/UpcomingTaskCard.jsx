import React from 'react';
import StatusPill from "../../../components/ui/StatusPill";
import { formatDate, resolveEntityId } from "../../../utils/helpers";

const DELIVERY_ACTIONS = [
  { status: "PICKED_UP",             label: "Mark Picked Up",  tone: "bg-[#1d4ed8] hover:bg-[#1e40af] text-white" },
  { status: "OUT_FOR_DELIVERY",      label: "Out for Delivery", tone: "bg-indigo-600 hover:bg-indigo-700 text-white" },
  { status: "COMPLETED",             label: "Delivered",        tone: "bg-[#15803d] hover:bg-[#166534] text-white" },
  { status: "CANCELLED_BY_DELIVERY", label: "Cancel / Issue",   tone: "border border-[#fecaca] bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#b91c1c]" },
];

export default function UpcomingTaskCard({ delivery, note, onNoteChange, onUpdateStatus, actionLoading, onTrackMap }) {
  const id = resolveEntityId(delivery);
  const status = String(delivery?.status || "ASSIGNED").toUpperCase();

  return (
    <article className="flex flex-col rounded-[28px] border border-[#ece6dc] bg-[#fffdfa] p-5 transition hover:border-[#dccdb7] hover:bg-white">

      {/* Order Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">Order No.</p>
          <h2 className="mt-0.5 text-base font-semibold tracking-[-0.01em] text-[#111827]">
            #{String(delivery?.orderId).substring(0, 12)}
          </h2>
        </div>
        <StatusPill status={status} />
      </div>

      {/* Info Block */}
      <div className="flex-1 rounded-[22px] border border-[#e8e0d5] bg-white p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9a8f7a]">Phone</span>
          <span className="text-sm font-medium text-[#374151]">{delivery?.customerContactNumber || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9a8f7a]">Assigned</span>
          <span className="text-sm font-medium text-[#374151]">{formatDate(delivery?.assignedAt)}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9a8f7a]">Destination</span>
          <span className="text-sm font-medium text-[#374151] leading-relaxed">
            {delivery?.deliveryLocation?.address || "Address not provided"}
          </span>

          {delivery?.deliveryLocation?.latitude && delivery?.deliveryLocation?.longitude && (
            <>
              <span className="flex items-center gap-1.5 text-xs text-[#8b95a7]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {delivery.deliveryLocation.latitude}, {delivery.deliveryLocation.longitude}
              </span>
              <button
                type="button"
                onClick={() => onTrackMap(id)}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1d4ed8] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1e40af]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Track & Navigate
              </button>
            </>
          )}
        </div>

        {delivery?.notes && (
          <div className="border-t border-[#efeae2] pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a8f7a]">Shipment Notes</span>
            <p className="mt-1 text-sm italic text-[#6b7280]">"{delivery.notes}"</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-3 border-t border-[#efeae2] pt-4">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">Note</span>
          <input
            type="text"
            value={note || ""}
            onChange={(e) => onNoteChange(id, e.target.value)}
            placeholder="Tracking update..."
            className="w-full rounded-2xl border border-[#e4ddd2] bg-white px-3 py-2 text-xs text-[#111827] outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 placeholder:text-[#c4bfb7]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {DELIVERY_ACTIONS.map((action) => (
            <button
              key={action.status}
              type="button"
              disabled={actionLoading === `${id}:${action.status}` || status === action.status}
              onClick={() => onUpdateStatus(id, action.status)}
              className={`rounded-2xl px-2 py-2.5 text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${action.tone}`}
            >
              {actionLoading === `${id}:${action.status}` ? "Updating..." : action.label}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

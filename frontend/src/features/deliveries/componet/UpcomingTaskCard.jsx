import React from 'react';
import StatusPill from "../../../components/ui/StatusPill";
import { formatDate, resolveEntityId } from "../../../utils/helpers";

const DELIVERY_ACTIONS = [
  {
    status: "PICKED_UP",
    label: "Mark Picked Up",
    tone: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  {
    status: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    tone: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
  {
    status: "COMPLETED",
    label: "Delivered",
    tone: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  {
    status: "CANCELLED_BY_DELIVERY",
    label: "Cancel / Issue",
    tone: "bg-rose-100 hover:bg-rose-200 text-rose-700",
  },
];

export default function UpcomingTaskCard({ delivery, note, onNoteChange, onUpdateStatus, actionLoading, onTrackMap }) {
  const id = resolveEntityId(delivery);
  const status = String(delivery?.status || "ASSIGNED").toUpperCase();

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:bg-slate-50">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Order No.</p>
          <h2 className="text-lg font-black text-slate-800 break-all">
            Order #{String(delivery?.orderId)}
          </h2>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="flex-1 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm shadow-slate-100/50">
        <div className="flex justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</span>
          <span className="text-sm font-semibold text-slate-700">
            {delivery?.customerContactNumber || "N/A"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned</span>
          <span className="text-sm font-semibold text-slate-700">
            {formatDate(delivery?.assignedAt)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Destination</span>
          <span className="text-sm font-semibold text-slate-700">
            {delivery?.deliveryLocation?.address || "Address not provided"}
          </span>
          {(delivery?.deliveryLocation?.latitude || delivery?.deliveryLocation?.longitude) && (
            <span className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {delivery?.deliveryLocation?.latitude || "-"}, {delivery?.deliveryLocation?.longitude || "-"}
            </span>
          )}
          
          {(delivery?.deliveryLocation?.latitude && delivery?.deliveryLocation?.longitude) && (
            <button
              type="button"
              onClick={() => onTrackMap(id)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Track Order & Navigate
            </button>
          )}
        </div>
        
        {delivery?.notes && (
          <div className="flex flex-col gap-1 border-t border-slate-200/60 pt-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Shipment Notes</span>
            <span className="text-sm font-medium italic text-slate-600">
              "{delivery.notes}"
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-slate-400 text-nowrap">Tracking Note</span>
          <input
            type="text"
            value={note || ""}
            onChange={(e) => onNoteChange(id, e.target.value)}
            placeholder="E.g. Traffic delay, arrived..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-1">
          {DELIVERY_ACTIONS.map((action) => (
            <button
              key={action.status}
              type="button"
              disabled={actionLoading === `${id}:${action.status}` || status === action.status}
              onClick={() => onUpdateStatus(id, action.status)}
              className={`rounded-xl px-2 py-2.5 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${action.tone}`}
            >
              {actionLoading === `${id}:${action.status}` ? "..." : action.label}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

import React from 'react';
import StatusPill from "../../../../../components/ui/StatusPill";
import { formatDate, resolveEntityId } from "../../../../../utils/helpers";

const UserDeliveriesDrawer = ({ isOpen, user, deliveries, normalizeRole, onClose }) => {
  if (!isOpen) return null;

  const completedCount = deliveries.filter(d => d.status === 'COMPLETED').length;
  const successRate = deliveries.length > 0
    ? ((completedCount / deliveries.length) * 100).toFixed(0)
    : 0;
  const tier = completedCount > 25 ? 'Legendary' : completedCount > 10 ? 'Professional' : 'Junior';
  const tierColor = completedCount > 25
    ? "text-amber-600 bg-amber-50 border-amber-200"
    : completedCount > 10
    ? "text-[#1d4ed8] bg-blue-50 border-blue-200"
    : "text-slate-600 bg-slate-100 border-slate-200";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200">
        <div className="flex h-full flex-col">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Driver Profile</p>
              <h2 className="text-lg font-bold text-slate-800">{user?.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Profile Section */}
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1d4ed8]/10 text-[#1d4ed8] text-xl font-bold border border-[#1d4ed8]/20">
                  {user?.name?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-800">{user?.name}</h3>
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tierColor}`}>
                      {tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">#{resolveEntityId(user)?.substring(0, 12)}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                      user?.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {user?.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Deliveries</p>
                  <p className="mt-1 text-xl font-bold text-slate-800">{deliveries.length}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Completed</p>
                  <p className="mt-1 text-xl font-bold text-[#1d4ed8]">{completedCount}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Success</p>
                  <p className="mt-1 text-xl font-bold text-emerald-600">{successRate}%</p>
                </div>
              </div>
            </div>

            {/* Delivery History */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Delivery History</h4>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{deliveries.length} records</span>
              </div>

              {deliveries.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-200 py-10">
                  <p className="text-sm text-slate-400">No delivery records found.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {deliveries.map((delivery) => {
                    const did = resolveEntityId(delivery);
                    return (
                      <div key={did} className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-500">
                            #{String(delivery.orderId).substring(0, 8).toUpperCase()}
                          </span>
                          <StatusPill status={normalizeRole(delivery.status)} />
                        </div>
                        <p className="mt-2 text-xs text-slate-400">{formatDate(delivery.assignedAt)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDeliveriesDrawer;

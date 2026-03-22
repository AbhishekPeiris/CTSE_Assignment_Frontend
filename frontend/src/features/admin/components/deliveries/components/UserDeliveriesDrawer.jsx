import React from 'react';
import StatusPill from "../../../../../components/ui/StatusPill";
import { formatDate, resolveEntityId } from "../../../../../utils/helpers";

const UserDeliveriesDrawer = ({ isOpen, user, deliveries, normalizeRole, onClose }) => {
  if (!isOpen) return null;

  const completedCount = deliveries.filter(d => d.status === 'COMPLETED').length;
  const cancelledCount = deliveries.filter(d =>
    ['CANCELLED_BY_DELIVERY', 'CANCELLED_BY_ADMIN', 'CANCELLED_BY_USER'].includes(d.status)
  ).length;
  const successRate = deliveries.length > 0
    ? ((completedCount / deliveries.length) * 100).toFixed(0)
    : 0;
  const tier = completedCount > 25 ? 'Legendary' : completedCount > 10 ? 'Professional' : 'Junior';

  return (
    <>
      <div className="fixed inset-0 z-40 bg-label/30 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-line shadow-2xl">
        <div className="flex h-full flex-col">

          {/* Header */}
          <div className="border-b border-line bg-[#fcfaf6] px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-word">Driver Profile</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-label">{user?.name}</h2>
            <p className="mt-1 text-sm font-mono text-word/60">#{resolveEntityId(user)?.substring(0, 16)}</p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-xl border border-line bg-white p-2 text-word transition hover:bg-[#f5f0ea] hover:text-label"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex-1 overflow-y-auto">

            {/* Profile Summary */}
            <div className="border-b border-line bg-white px-6 py-5">
              <div className="flex items-center gap-4 mb-5">
                {/* Avatar */}
                <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-primary/10 bg-primary/5 text-xl font-bold text-primary">
                  {user?.name?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`rounded-xl px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider border ${
                      completedCount > 25
                        ? "border-warning/20 bg-warning/5 text-warning"
                        : completedCount > 10
                        ? "border-primary/20 bg-primary/5 text-primary"
                        : "border-line bg-[#fcfaf6] text-word"
                    }`}>
                      {tier}
                    </span>
                    <span className={`rounded-xl px-2.5 py-0.5 text-[11px] font-semibold border ${
                      user?.isActive
                        ? "border-success/20 bg-success/5 text-success"
                        : "border-danger/20 bg-danger/5 text-danger"
                    }`}>
                      {user?.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-word/60">
                    Joined {formatDate(user?.createdAt)?.split(',')[0] || '—'}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-[22px] border border-line bg-[#fcfaf6] px-3 py-3 text-center transition hover:border-primary/20 hover:bg-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-word">Total</p>
                  <p className="mt-1.5 text-2xl font-semibold text-label">{deliveries.length}</p>
                </div>
                <div className="rounded-[22px] border border-primary/20 bg-primary/5 px-3 py-3 text-center transition hover:bg-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-word">Done</p>
                  <p className="mt-1.5 text-2xl font-semibold text-primary">{completedCount}</p>
                </div>
                <div className="rounded-[22px] border border-success/20 bg-success/5 px-3 py-3 text-center transition hover:bg-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-word">Rate</p>
                  <p className="mt-1.5 text-2xl font-semibold text-success">{successRate}%</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between">
                  <span className="text-[11px] font-semibold text-word uppercase tracking-wider">Success rate</span>
                  <span className="text-[11px] font-semibold text-label">{successRate}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Delivery History */}
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-word">
                  Delivery History
                </p>
                <span className="rounded-xl border border-line bg-white px-2.5 py-1 text-xs font-semibold text-word/70">
                  {deliveries.length} records
                </span>
              </div>

              {deliveries.length === 0 ? (
                <div className="flex items-center justify-center rounded-[24px] border border-dashed border-line/60 bg-white py-12">
                  <p className="text-sm text-word/60">No delivery records found.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {deliveries.map((delivery) => {
                    const did = resolveEntityId(delivery);
                    return (
                      <div
                        key={did}
                        className="flex items-center justify-between gap-3 rounded-[22px] border border-line bg-white px-4 py-3.5 transition hover:border-primary/40 hover:shadow-sm"
                      >
                        <div className="min-w-0">
                          <span className="rounded-lg border border-line bg-white px-2 py-1 text-[11px] font-mono text-word/70">
                            #{String(delivery.orderId).substring(0, 8).toUpperCase()}
                          </span>
                          <p className="mt-1.5 text-xs text-word/60">{formatDate(delivery.assignedAt)}</p>
                        </div>
                        <StatusPill status={normalizeRole(delivery.status)} />
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

import React from 'react';

export default function DeliverySummary({ totalAssigned, pendingCount, completedCount }) {
  return (
    <div className="mb-6 grid grid-cols-3 gap-3">
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-slate-400 bg-white px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Assigned</p>
        <p className="mt-2 text-3xl font-bold text-slate-800">{totalAssigned}</p>
        <p className="mt-1 text-xs text-slate-400">today</p>
      </div>
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-[#1d4ed8] bg-white px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pending</p>
        <p className="mt-2 text-3xl font-bold text-[#1d4ed8]">{pendingCount}</p>
        <p className="mt-1 text-xs text-slate-400">deliveries</p>
      </div>
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Completed</p>
        <p className="mt-2 text-3xl font-bold text-emerald-600">{completedCount}</p>
        <p className="mt-1 text-xs text-slate-400">successful</p>
      </div>
    </div>
  );
}

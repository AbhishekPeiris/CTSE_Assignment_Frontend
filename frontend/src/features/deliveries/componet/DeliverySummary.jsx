import React from 'react';

export default function DeliverySummary({ totalAssigned, pendingCount, completedCount }) {
  return (
    <div className="mb-8 grid grid-cols-3 gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 line-clamp-1">
          Total Assigned
        </p>
        <p className="mt-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
          <span className="text-xl sm:text-3xl font-black text-slate-800">{totalAssigned}</span>
          <span className="text-[10px] sm:text-sm font-medium text-slate-500 leading-none">today</span>
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 line-clamp-1">
          Pending Next
        </p>
        <p className="mt-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
          <span className="text-xl sm:text-3xl font-black text-blue-600">{pendingCount}</span>
          <span className="text-[10px] sm:text-sm font-medium text-slate-500 leading-none">deliveries</span>
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 line-clamp-1">
          Completed
        </p>
        <p className="mt-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
          <span className="text-xl sm:text-3xl font-black text-emerald-600">{completedCount}</span>
          <span className="text-[10px] sm:text-sm font-medium text-slate-500 leading-none">successful</span>
        </p>
      </div>
    </div>
  );
}

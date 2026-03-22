import React from 'react';

export default function DeliverySummary({ totalAssigned, pendingCount, completedCount }) {
  return (
    <div className="mb-6 grid grid-cols-3 gap-3">
      <div className="rounded-[24px] border border-line bg-white px-5 py-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-word">Total Assigned</p>
        <p className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-label">{totalAssigned}</p>
        <p className="mt-1 text-xs text-word">today</p>
      </div>
      <div className="rounded-[24px] border border-line bg-white px-5 py-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-word">Pending</p>
        <p className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-primary">{pendingCount}</p>
        <p className="mt-1 text-xs text-word">deliveries</p>
      </div>
      <div className="rounded-[24px] border border-line bg-white px-5 py-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-word">Completed</p>
        <p className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-success">{completedCount}</p>
        <p className="mt-1 text-xs text-word">successful</p>
      </div>
    </div>
  );
}

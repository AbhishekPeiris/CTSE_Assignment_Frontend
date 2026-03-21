import React from 'react';

export default function DeliverySummary({ totalAssigned, pendingCount, completedCount }) {
  return (
    <div className="mb-6 grid grid-cols-3 gap-3">
      <div className="rounded-[24px] border border-[#ece6dc] bg-[#fdfaf5] px-5 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">Total Assigned</p>
        <p className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#111827]">{totalAssigned}</p>
        <p className="mt-1 text-xs text-[#8b95a7]">today</p>
      </div>
      <div className="rounded-[24px] border border-[#e5edf8] bg-[#f9fbff] px-5 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">Pending</p>
        <p className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#1d4ed8]">{pendingCount}</p>
        <p className="mt-1 text-xs text-[#8b95a7]">deliveries</p>
      </div>
      <div className="rounded-[24px] border border-[#e5ede5] bg-[#f3fbf5] px-5 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">Completed</p>
        <p className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#15803d]">{completedCount}</p>
        <p className="mt-1 text-xs text-[#8b95a7]">successful</p>
      </div>
    </div>
  );
}

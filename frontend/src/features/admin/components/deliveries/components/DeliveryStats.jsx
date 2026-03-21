import React from 'react';

const StatCard = ({ label, value, accentClass, valueClass = "text-slate-800" }) => (
  <div className={`rounded-xl border border-slate-200 bg-white border-l-4 ${accentClass} px-5 py-5`}>
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
    <p className={`mt-3 text-3xl font-bold ${valueClass}`}>{value}</p>
  </div>
);

const DeliveryStats = ({ pendingCount, inTransitCount, totalCount, usersCount }) => {
  return (
    <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4 mb-6">
      <StatCard label="Pending Assign"   value={pendingCount}   accentClass="border-l-amber-400"   valueClass="text-amber-600" />
      <StatCard label="In Transit"       value={inTransitCount} accentClass="border-l-[#1d4ed8]"   valueClass="text-[#1d4ed8]" />
      <StatCard label="Total Deliveries" value={totalCount}     accentClass="border-l-indigo-400"  valueClass="text-indigo-600" />
      <StatCard label="Delivery Users"   value={usersCount}     accentClass="border-l-slate-400"   valueClass="text-slate-700" />
    </div>
  );
};

export default DeliveryStats;

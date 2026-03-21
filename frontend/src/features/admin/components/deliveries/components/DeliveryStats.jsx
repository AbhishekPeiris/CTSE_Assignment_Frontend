import React from 'react';

const StatCard = ({ label, value, valueClass = "text-slate-800", unit }) => (
  <div className="rounded-2xl border border-[#e5edf8] bg-[#f9fbff] px-5 py-5">
    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-2 flex items-baseline gap-2">
      <span className={`text-3xl font-black ${valueClass}`}>{value}</span>
      {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
    </p>
  </div>
);

const DeliveryStats = ({ pendingCount, inTransitCount, totalCount, usersCount }) => {
  return (
    <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4 mb-6">
      <StatCard label="Pending Assign"   value={pendingCount}   valueClass="text-amber-500"    unit="orders" />
      <StatCard label="In Transit"       value={inTransitCount} valueClass="text-blue-600"     unit="active" />
      <StatCard label="Total Deliveries" value={totalCount}     valueClass="text-indigo-600"   unit="total" />
      <StatCard label="Delivery Users"   value={usersCount}     valueClass="text-slate-800"    unit="drivers" />
    </div>
  );
};

export default DeliveryStats;

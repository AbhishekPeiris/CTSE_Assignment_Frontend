import React from 'react';

const StatCard = ({ label, value, valueClass = "text-label", unit }) => (
  <div className="rounded-2xl border border-line bg-white px-5 py-5 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wider text-word">{label}</p>
    <p className="mt-2 flex items-baseline gap-2">
      <span className={`text-3xl font-black ${valueClass}`}>{value}</span>
      {unit && <span className="text-sm font-medium text-word/60">{unit}</span>}
    </p>
  </div>
);

const DeliveryStats = ({ pendingCount, inTransitCount, totalCount, usersCount }) => {
  return (
    <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4 mb-6">
      <StatCard label="Pending Assign"   value={pendingCount}   valueClass="text-warning"    unit="orders" />
      <StatCard label="In Transit"       value={inTransitCount} valueClass="text-primary"     unit="active" />
      <StatCard label="Total Deliveries" value={totalCount}     valueClass="text-label"   unit="total" />
      <StatCard label="Delivery Users"   value={usersCount}     valueClass="text-label"    unit="drivers" />
    </div>
  );
};

export default DeliveryStats;

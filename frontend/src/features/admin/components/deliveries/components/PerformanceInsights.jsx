import React, { useMemo } from 'react';
import { resolveEntityId } from "../../../../../utils/helpers";

const PerformanceInsights = ({ deliveries, deliveryUsers }) => {
  const stats = useMemo(() => {
    const completedDeliveries = deliveries.filter(d => d.status === 'COMPLETED' && d.assignedAt && d.completedAt);

    const avgCompletionTimeMinutes = completedDeliveries.length > 0
      ? (completedDeliveries.reduce((acc, curr) => {
          const duration = (new Date(curr.completedAt) - new Date(curr.assignedAt)) / (1000 * 60);
          return acc + duration;
        }, 0) / completedDeliveries.length).toFixed(1)
      : "N/A";

    const driverStats = deliveryUsers.map(user => {
      const uid = resolveEntityId(user);
      const userDeliveries = deliveries.filter(d => d.deliveryUserId === uid);
      const completed = userDeliveries.filter(d => d.status === 'COMPLETED').length;
      const successRate = userDeliveries.length > 0
        ? ((completed / userDeliveries.length) * 100).toFixed(0)
        : 0;
      return {
        id: uid,
        name: user.name,
        completed,
        successRate,
        points: user.loyaltyPoints || 0,
        rank: completed > 20 ? 'Elite' : completed > 10 ? 'Senior' : 'Junior'
      };
    }).sort((a, b) => b.completed - a.completed);

    return {
      avgCompletionTimeMinutes,
      topDrivers: driverStats.slice(0, 3),
      overallSuccessRate: deliveries.length > 0
        ? ((deliveries.filter(d => d.status === 'COMPLETED').length / deliveries.length) * 100).toFixed(0)
        : 0
    };
  }, [deliveries, deliveryUsers]);

  const rankColors = {
    Elite:  { text: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200" },
    Senior: { text: "text-[#1d4ed8]",  bg: "bg-blue-50",   border: "border-blue-200"  },
    Junior: { text: "text-slate-600",  bg: "bg-slate-100", border: "border-slate-200" },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
      {/* Efficiency Metrics */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Efficiency Metrics</p>
        <h3 className="mt-1 text-base font-bold text-slate-800">Operational Speed</h3>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-[#1d4ed8]">{stats.avgCompletionTimeMinutes}</span>
          <span className="text-sm font-medium text-slate-400">avg min</span>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Success Rate</span>
            <span className="text-xs font-bold text-emerald-600">{stats.overallSuccessRate}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${stats.overallSuccessRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Driver Leaderboard */}
      <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Driver Performance</p>
            <h3 className="mt-1 text-base font-bold text-slate-800">Top Couriers</h3>
          </div>
          <div className="rounded-lg bg-[#1d4ed8]/10 p-2 text-[#1d4ed8]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>

        {stats.topDrivers.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-200 py-10">
            <p className="text-sm text-slate-400">No data yet — complete some deliveries first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stats.topDrivers.map((driver, index) => {
              const rank = rankColors[driver.rank] || rankColors.Junior;
              return (
                <div key={driver.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  {/* Rank + name */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1d4ed8]/10 text-[#1d4ed8] text-xs font-bold">
                      {driver.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">#{index + 1}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 truncate">{driver.name}</p>
                  <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${rank.bg} ${rank.text} border ${rank.border}`}>
                    {driver.rank}
                  </span>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">Completed</p>
                      <p className="text-xl font-bold text-slate-800">{driver.completed}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-emerald-600">{driver.successRate}% SR</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{driver.points} pts</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceInsights;

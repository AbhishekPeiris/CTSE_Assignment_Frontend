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
    Elite:  { text: "text-warning",  bg: "bg-warning/5",  border: "border-warning/20" },
    Senior: { text: "text-primary",  bg: "bg-primary/5",   border: "border-primary/20"  },
    Junior: { text: "text-word",  bg: "bg-white", border: "border-line" },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
      {/* Efficiency Metrics */}
      <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-word">Efficiency Metrics</p>
        <h3 className="mt-1 text-base font-bold text-label">Operational Speed</h3>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-primary">{stats.avgCompletionTimeMinutes}</span>
          <span className="text-sm font-medium text-word">avg min</span>
        </div>

        <div className="mt-6 border-t border-line pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-word">Success Rate</span>
            <span className="text-xs font-bold text-success">{stats.overallSuccessRate}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-success transition-all duration-700"
              style={{ width: `${stats.overallSuccessRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Driver Leaderboard */}
      <div className="lg:col-span-2 rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-word">Driver Performance</p>
            <h3 className="mt-1 text-base font-bold text-label">Top Couriers</h3>
          </div>
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>

        {stats.topDrivers.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-line py-10">
            <p className="text-sm text-word">No data yet — complete some deliveries first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stats.topDrivers.map((driver, index) => {
              const rank = rankColors[driver.rank] || rankColors.Junior;
              return (
                <div key={driver.id} className="rounded-xl border border-line bg-white p-4 shadow-sm">
                  {/* Rank + name */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {driver.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-bold text-word">#{index + 1}</span>
                  </div>
                  <p className="text-sm font-semibold text-label truncate">{driver.name}</p>
                  <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${rank.bg} ${rank.text} border ${rank.border}`}>
                    {driver.rank}
                  </span>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-word uppercase tracking-wide">Completed</p>
                      <p className="text-xl font-bold text-label">{driver.completed}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-success">{driver.successRate}% SR</p>
                      <p className="text-[10px] text-word mt-0.5">{driver.points} pts</p>
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

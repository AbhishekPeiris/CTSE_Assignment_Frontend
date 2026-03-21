import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Loader from "../../../components/ui/Loader";
import { useAppContext } from "../../../app/providers/AppProvider";
import { DeliveryService } from "../../../services/delivery.service";
import { resolveEntityId } from "../../../utils/helpers";
import TrackingMapOverlay from "../componet/TrackingMapOverlay";
import DeliverySummary from "../componet/DeliverySummary";
import UpcomingTaskCard from "../componet/UpcomingTaskCard";
import MyActivityTable from "../componet/MyActivityTable";

const TERMINAL_STATUSES = new Set([
  "COMPLETED",
  "CANCELLED_BY_DELIVERY",
  "FAILED",
  "RETURNED",
]);

export default function DeliveryPortalPage() {
  const navigate = useNavigate();
  const { auth, logout } = useAppContext();

  const [activeMapId, setActiveMapId] = useState(null);
  const [state, setState] = useState({ loading: true, error: "", deliveries: [] });
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [notesByDelivery, setNotesByDelivery] = useState({});
  const [activeTab, setActiveTab] = useState("upcoming");

  const loadDeliveries = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const response = await DeliveryService.getMyTodayDeliveries();
      setState({ loading: false, error: "", deliveries: Array.isArray(response) ? response : [] });
    } catch (error) {
      setState({
        loading: false,
        error: error?.friendlyMessage || error?.message || "Unable to load today assignments",
        deliveries: [],
      });
    }
  }, []);

  useEffect(() => { loadDeliveries(); }, [loadDeliveries]);

  const handleUpdateStatus = async (deliveryId, status) => {
    setActionError("");
    setActionSuccess("");
    setActionLoading(`${deliveryId}:${status}`);
    try {
      await DeliveryService.updateDeliveryStatus(deliveryId, {
        status,
        notes: notesByDelivery[deliveryId] || undefined,
      });
      setActionSuccess("Status updated successfully.");
      await loadDeliveries();
    } catch (error) {
      setActionError(error?.friendlyMessage || error?.message || "Failed to update status");
    } finally {
      setActionLoading("");
    }
  };

  const handleNoteChange = (id, text) => {
    setNotesByDelivery((prev) => ({ ...prev, [id]: text }));
  };

  const upcomingDeliveries = useMemo(
    () => state.deliveries.filter((d) => !TERMINAL_STATUSES.has(String(d?.status).toUpperCase())),
    [state.deliveries],
  );

  const pastDeliveries = useMemo(
    () => state.deliveries.filter((d) => TERMINAL_STATUSES.has(String(d?.status).toUpperCase())),
    [state.deliveries],
  );

  const completedCount = pastDeliveries.filter(
    (d) => String(d?.status).toUpperCase() === "COMPLETED"
  ).length;

  const levelThreshold = completedCount > 10 ? 26 : 11;
  const levelProgress = Math.min((completedCount / levelThreshold) * 100, 100);
  const levelLabel = completedCount > 25 ? "Legendary Courier" : completedCount > 10 ? "Professional Driver" : "Junior Runner";
  const levelNum = completedCount > 25 ? 3 : completedCount > 10 ? 2 : 1;

  const tabs = [
    { id: "upcoming", label: "Upcoming", count: upcomingDeliveries.length },
    { id: "activity", label: "My Activity", count: pastDeliveries.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Driver Portal</h1>
            <p className="text-sm text-slate-400">
              Welcome, {auth?.user?.name || auth?.user?.contactNumber || "Driver"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadDeliveries}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Sync
            </button>
            <button
              type="button"
              onClick={() => { logout(); navigate("/login", { replace: true }); }}
              className="rounded-lg bg-[#1d4ed8] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        {/* Alerts */}
        <div className="mb-6 space-y-2">
          <ErrorMessage message={state.error} />
          <ErrorMessage message={actionError} />
          {actionSuccess && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {actionSuccess}
            </div>
          )}
        </div>

        {/* Summary */}
        <DeliverySummary
          totalAssigned={state.deliveries.length}
          pendingCount={upcomingDeliveries.length}
          completedCount={completedCount}
        />

        {/* Driver Level Card */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#1d4ed8]/20 bg-[#1d4ed8]/10 text-sm font-bold text-[#1d4ed8]">
                L{levelNum}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Driver Status</p>
                <p className="text-sm font-bold text-slate-800">{levelLabel}</p>
              </div>
            </div>
            <span className="rounded-lg bg-[#1d4ed8]/10 px-3 py-1 text-xs font-semibold text-[#1d4ed8]">
              {completedCount > 25 ? "Max Level" : `${levelThreshold - completedCount} to next level`}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#1d4ed8] transition-all duration-700"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-[10px] font-medium text-slate-400">Level {levelNum}</span>
            <span className="text-[10px] font-medium text-slate-400">{completedCount} completed</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "text-[#1d4ed8]"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1d4ed8] rounded-t" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {state.loading ? (
          <div className="py-12">
            <Loader text="Loading your assignments..." />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeTab === "upcoming" ? (
              upcomingDeliveries.length === 0 ? (
                <div className="col-span-full flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16">
                  <p className="text-sm text-slate-400">No upcoming deliveries assigned.</p>
                </div>
              ) : (
                upcomingDeliveries.map((delivery) => (
                  <UpcomingTaskCard
                    key={resolveEntityId(delivery)}
                    delivery={delivery}
                    note={notesByDelivery[resolveEntityId(delivery)]}
                    onNoteChange={handleNoteChange}
                    onUpdateStatus={handleUpdateStatus}
                    actionLoading={actionLoading}
                    onTrackMap={setActiveMapId}
                  />
                ))
              )
            ) : (
              <MyActivityTable deliveries={pastDeliveries} />
            )}
          </div>
        )}
      </main>

      {activeMapId && (() => {
        const delivery = state.deliveries.find((d) => resolveEntityId(d) === activeMapId);
        return <TrackingMapOverlay delivery={delivery} onClose={() => setActiveMapId(null)} />;
      })()}
    </div>
  );
}

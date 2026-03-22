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

  const handleUpdateStatus = async (deliveryId, status, failureReason) => {
    setActionError("");
    setActionSuccess("");
    setActionLoading(`${deliveryId}:${status}`);
    try {
      await DeliveryService.updateDeliveryStatus(deliveryId, {
        status,
        notes: notesByDelivery[deliveryId] || undefined,
        failureReason: failureReason || undefined,
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
    { id: "upcoming", label: "Upcoming Tasks", count: upcomingDeliveries.length },
    { id: "activity", label: "My Activity",    count: pastDeliveries.length },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-line bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-word">Driver Portal</p>
            <h1 className="mt-0.5 text-lg font-semibold tracking-[-0.02em] text-label">
              {auth?.user?.name || auth?.user?.contactNumber || "Driver"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadDeliveries}
              className="rounded-2xl border border-line bg-white px-4 py-2 text-sm font-semibold text-word transition hover:bg-white hover:text-label"
            >
              Sync
            </button>
            <button
              type="button"
              onClick={() => { logout(); navigate("/login", { replace: true }); }}
              className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
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
            <div className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium text-success">
              {actionSuccess}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <DeliverySummary
          totalAssigned={state.deliveries.length}
          pendingCount={upcomingDeliveries.length}
          completedCount={completedCount}
        />

        {/* Driver Level Card */}
        <div className="mb-6 rounded-[28px] border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-line bg-white text-sm font-bold text-primary">
                L{levelNum}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-word">Driver Status</p>
                <p className="mt-0.5 text-sm font-semibold text-label">{levelLabel}</p>
              </div>
            </div>
            <span className="rounded-2xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-primary">
              {completedCount > 25 ? "Max Level" : `${levelThreshold - completedCount} to next level`}
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-[10px] font-medium text-word">Level {levelNum}</span>
            <span className="text-[10px] font-medium text-word">{completedCount} completed</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-line">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "text-label"
                  : "text-word hover:text-label"
              }`}
            >
              {tab.label}
              <span className="ml-2 rounded-xl border border-line bg-white px-2 py-0.5 text-xs font-semibold text-word">
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-primary" />
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
                <div className="col-span-full flex items-center justify-center rounded-[28px] border border-dashed border-[#ddd4c7] bg-[#fcfaf6] py-16">
                  <p className="text-sm text-[#8b95a7]">No upcoming deliveries assigned.</p>
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

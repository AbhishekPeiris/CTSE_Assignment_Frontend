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

  const [state, setState] = useState({
    loading: true,
    error: "",
    deliveries: [],
  });
  
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [notesByDelivery, setNotesByDelivery] = useState({});
  const [activeTab, setActiveTab] = useState("upcoming");

  const loadDeliveries = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await DeliveryService.getMyTodayDeliveries();
      const deliveries = Array.isArray(response) ? response : [];

      setState({
        loading: false,
        error: "",
        deliveries,
      });
    } catch (error) {
      setState({
        loading: false,
        error:
          error?.friendlyMessage ||
          error?.message ||
          "Unable to load today assignments",
        deliveries: [],
      });
    }
  }, []);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const handleUpdateStatus = async (deliveryId, status) => {
    setActionError("");
    setActionSuccess("");
    setActionLoading(`${deliveryId}:${status}`);

    try {
      await DeliveryService.updateDeliveryStatus(deliveryId, {
        status,
        notes: notesByDelivery[deliveryId] || undefined,
      });

      setActionSuccess("Delivery status updated.");
      await loadDeliveries();
    } catch (error) {
      setActionError(
        error?.friendlyMessage ||
          error?.message ||
          "Failed to update delivery status",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleNoteChange = (id, text) => {
    setNotesByDelivery((prev) => ({
      ...prev,
      [id]: text,
    }));
  };

  const upcomingDeliveries = useMemo(
    () =>
      state.deliveries.filter(
        (d) => !TERMINAL_STATUSES.has(String(d?.status).toUpperCase()),
      ),
    [state.deliveries],
  );

  const pastDeliveries = useMemo(
    () =>
      state.deliveries.filter((d) =>
        TERMINAL_STATUSES.has(String(d?.status).toUpperCase()),
      ),
    [state.deliveries],
  );

  const completedCount = pastDeliveries.filter(
    (d) => String(d?.status).toUpperCase() === "COMPLETED"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Driver Portal
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Welcome back, {auth?.user?.name || auth?.user?.contactNumber || 'Driver'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadDeliveries}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Sync
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="mb-6 space-y-3">
          <ErrorMessage message={state.error} />
          <ErrorMessage message={actionError} />
          {actionSuccess ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {actionSuccess}
            </div>
          ) : null}
        </div>

        <DeliverySummary 
          totalAssigned={state.deliveries.length}
          pendingCount={upcomingDeliveries.length}
          completedCount={completedCount}
        />

        <div className="mb-6 flex space-x-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === "upcoming"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            Upcoming Tasks
            <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {upcomingDeliveries.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === "activity"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            My Activity
            <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {pastDeliveries.length}
            </span>
          </button>
        </div>

        {state.loading ? (
          <div className="py-12">
            <Loader text="Loading your assignments..." />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeTab === "upcoming" ? (
              upcomingDeliveries.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-slate-200 bg-white py-16 text-center">
                  <p className="text-sm font-medium text-slate-500">You have no upcoming deliveries assigned.</p>
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

      {/* Full Screen Tracking Overlay Component */}
      {activeMapId && (() => {
        const delivery = state.deliveries.find((d) => resolveEntityId(d) === activeMapId);
        return <TrackingMapOverlay delivery={delivery} onClose={() => setActiveMapId(null)} />;
      })()}
    </div>
  );
}

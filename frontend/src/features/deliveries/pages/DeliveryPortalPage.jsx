import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Loader from "../../../components/ui/Loader";
import StatusPill from "../../../components/ui/StatusPill";
import { useAppContext } from "../../../app/providers/AppProvider";
import { DeliveryService } from "../../../services/delivery.service";
import { formatDate, resolveEntityId } from "../../../utils/helpers";

const DELIVERY_ACTIONS = [
    { status: "COMPLETED", label: "Mark Completed", tone: "bg-emerald-600 hover:bg-emerald-700" },
    {
        status: "CANCELLED_BY_DELIVERY",
        label: "Cancel by Delivery",
        tone: "bg-rose-600 hover:bg-rose-700",
    },
];

const TERMINAL_STATUSES = new Set(["COMPLETED", "CANCELLED_BY_DELIVERY"]);

export default function DeliveryPortalPage() {
    const navigate = useNavigate();
    const { auth, logout } = useAppContext();

    const [state, setState] = useState({ loading: true, error: "", deliveries: [] });
    const [actionError, setActionError] = useState("");
    const [actionLoading, setActionLoading] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");
    const [notesByDelivery, setNotesByDelivery] = useState({});

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
                error: error?.friendlyMessage || error?.message || "Unable to load today assignments",
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
            setActionError(error?.friendlyMessage || error?.message || "Failed to update delivery status");
        } finally {
            setActionLoading("");
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f8ff]">
            <header className="sticky top-0 z-10 border-b border-[#dbe3f5] bg-white">
                <div className="mx-auto flex w-full max-w-[880px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Delivery portal</p>
                        <h1 className="text-xl font-semibold text-[#0f172a]">Today Assignments</h1>
                        <p className="text-xs text-[#64748b]">{auth?.user?.name || auth?.user?.contactNumber}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={loadDeliveries}
                            className="rounded-full border border-[#d1dbef] px-3 py-1.5 text-xs font-semibold text-[#334155]"
                        >
                            Refresh
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                logout();
                                navigate("/login", { replace: true });
                            }}
                            className="rounded-full bg-[#dc2626] px-3 py-1.5 text-xs font-semibold text-white"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[880px] px-4 py-4 sm:px-6">
                <div className="space-y-3">
                    <ErrorMessage message={state.error} />
                    <ErrorMessage message={actionError} />
                    {actionSuccess ? (
                        <div className="rounded-xl border border-[#b7e4c7] bg-[#ebfff1] px-3 py-2 text-sm text-[#166534]">
                            {actionSuccess}
                        </div>
                    ) : null}
                </div>

                {state.loading ? <Loader text="Loading your assignments..." /> : null}

                {state.loading || state.deliveries.length ? null : (
                    <div className="mt-4 rounded-2xl border border-[#dbe3f5] bg-white p-5 text-sm text-[#64748b]">
                        No deliveries assigned for today.
                    </div>
                )}

                {state.loading ? null : (
                    <div className="mt-4 space-y-3">
                        {state.deliveries.map((delivery) => {
                            const id = resolveEntityId(delivery);
                            const status = String(delivery?.status || "ASSIGNED").toUpperCase();
                            const isTerminal = TERMINAL_STATUSES.has(status);

                            return (
                                <article key={id} className="rounded-2xl border border-[#dbe3f5] bg-white p-4 shadow-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-[#64748b]">Order</p>
                                            <h2 className="text-base font-semibold text-[#0f172a]">{delivery?.orderId}</h2>
                                        </div>
                                        <StatusPill status={status} />
                                    </div>

                                    <div className="mt-3 space-y-1 text-sm text-[#334155]">
                                        <p>Customer contact: {delivery?.customerContactNumber || "N/A"}</p>
                                        <p>Assigned at: {formatDate(delivery?.assignedAt)}</p>
                                        <p>Location: {delivery?.deliveryLocation?.address || "N/A"}</p>
                                        <p className="text-xs text-[#64748b]">
                                            {delivery?.deliveryLocation?.latitude || "-"}, {delivery?.deliveryLocation?.longitude || "-"}
                                        </p>
                                    </div>

                                    <textarea
                                        rows={2}
                                        value={notesByDelivery[id] || ""}
                                        disabled={isTerminal}
                                        onChange={(event) =>
                                            setNotesByDelivery((prev) => ({
                                                ...prev,
                                                [id]: event.target.value,
                                            }))
                                        }
                                        placeholder="Notes (optional)"
                                        className="mt-3 w-full rounded-xl border border-[#d1dbef] px-3 py-2 text-sm text-[#1f2937] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe] disabled:opacity-50"
                                    />

                                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                        {DELIVERY_ACTIONS.map((action) => (
                                            <button
                                                key={action.status}
                                                type="button"
                                                disabled={
                                                    isTerminal || actionLoading === `${id}:${action.status}` || status === action.status
                                                }
                                                onClick={() => handleUpdateStatus(id, action.status)}
                                                className={[
                                                    "rounded-full px-3 py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50",
                                                    action.tone,
                                                ].join(" ")}
                                            >
                                                {actionLoading === `${id}:${action.status}` ? "Updating..." : action.label}
                                            </button>
                                        ))}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Loader from "../../../components/ui/Loader";
import StatusPill from "../../../components/ui/StatusPill";
import { OrderService } from "../../../services/order.service";
import { formatDate, formatMoney } from "../../../utils/helpers";

export default function UserOrderTrackingPage() {
    const { id } = useParams();

    const [state, setState] = useState({
        loading: true,
        error: "",
        order: null,
        tracking: null,
    });

    const loadData = async () => {
        setState((prev) => ({ ...prev, loading: true, error: "" }));

        try {
            const [order, tracking] = await Promise.all([
                OrderService.getOrderById(id),
                OrderService.getOrderTracking(id),
            ]);

            setState({
                loading: false,
                error: "",
                order,
                tracking,
            });
        } catch (error) {
            setState({
                loading: false,
                error: error?.friendlyMessage || error?.message || "Unable to load tracking information",
                order: null,
                tracking: null,
            });
        }
    };

    useEffect(() => {
        let cancelled = false;

        const fetchInitialData = async () => {
            try {
                const [order, tracking] = await Promise.all([
                    OrderService.getOrderById(id),
                    OrderService.getOrderTracking(id),
                ]);

                if (cancelled) {
                    return;
                }

                setState({
                    loading: false,
                    error: "",
                    order,
                    tracking,
                });
            } catch (error) {
                if (cancelled) {
                    return;
                }

                setState({
                    loading: false,
                    error: error?.friendlyMessage || error?.message || "Unable to load tracking information",
                    order: null,
                    tracking: null,
                });
            }
        };

        fetchInitialData();

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (state.loading) {
        return (
            <div className="mx-auto w-full max-w-[980px] px-4 py-6 sm:px-6 lg:px-8">
                <Loader text="Loading order tracking..." />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[980px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-[#dbe5f7] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-[#64748b]">Order tracking</p>
                        <h1 className="text-2xl font-semibold text-[#0f172a]">{id}</h1>
                    </div>
                    <button
                        type="button"
                        onClick={loadData}
                        className="rounded-full border border-[#d5ddec] px-4 py-2 text-xs font-semibold text-[#334155] transition hover:bg-[#f8fbff]"
                    >
                        Refresh
                    </button>
                </div>

                <div className="mt-3">
                    <ErrorMessage message={state.error} />
                </div>

                {state.order ? (
                    <div className="mt-4 space-y-4">
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl border border-[#e5edf8] bg-[#f9fbff] p-4">
                                <p className="text-xs uppercase tracking-wide text-[#64748b]">Order status</p>
                                <div className="mt-2">
                                    <StatusPill status={state.order.status} />
                                </div>
                                <p className="mt-2 text-sm text-[#475569]">Created: {formatDate(state.order.createdAt)}</p>
                                <p className="text-sm text-[#475569]">Completed: {formatDate(state.order.completedAt)}</p>
                            </div>

                            <div className="rounded-2xl border border-[#e5edf8] bg-[#f9fbff] p-4">
                                <p className="text-xs uppercase tracking-wide text-[#64748b]">Payment & loyalty</p>
                                <p className="mt-2 text-sm text-[#334155]">Payment: {state.order.paymentMethod || "CASH_ON_DELIVERY"}</p>
                                <p className="text-sm text-[#334155]">Loyalty used: {state.order.loyaltyPointsUsed || 0}</p>
                                <p className="text-sm text-[#334155]">Total: {formatMoney(state.order.totalAmount)}</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#e5edf8] bg-[#f9fbff] p-4">
                            <p className="text-xs uppercase tracking-wide text-[#64748b]">Delivery destination</p>
                            <p className="mt-2 text-sm text-[#334155]">{state.order.deliveryLocation?.address || "N/A"}</p>
                            <p className="text-xs text-[#64748b]">
                                {state.order.deliveryLocation?.latitude || "-"}, {state.order.deliveryLocation?.longitude || "-"}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#e5edf8] bg-[#f9fbff] p-4">
                            <p className="text-xs uppercase tracking-wide text-[#64748b]">Assigned delivery</p>
                            {state.tracking?.deliveryAssignment?.deliveryUserId ? (
                                <div className="mt-2 text-sm text-[#334155]">
                                    <p>Name: {state.tracking?.deliveryAssignment?.deliveryUserName || "N/A"}</p>
                                    <p>Delivery user id: {state.tracking?.deliveryAssignment?.deliveryUserId}</p>
                                    <p>Assigned at: {formatDate(state.tracking?.deliveryAssignment?.assignedAt)}</p>
                                    <p className="mt-2">
                                        Delivery status: <StatusPill status={state.tracking?.delivery?.status || state.tracking?.orderStatus} />
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-[#64748b]">No delivery assignment yet.</p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-[#e5edf8] bg-[#f9fbff] p-4">
                            <p className="text-xs uppercase tracking-wide text-[#64748b]">Items</p>
                            <ul className="mt-2 space-y-1 text-sm text-[#334155]">
                                {(state.order.items || []).map((item) => (
                                    <li key={`${item.productId}-${item.name}`} className="flex items-center justify-between gap-3">
                                        <span>{item.name}</span>
                                        <span>x {item.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : null}

                <div className="mt-5">
                    <Link to="/my-orders" className="text-sm font-semibold text-[#0f766e] underline">
                        Back to my orders
                    </Link>
                </div>
            </div>
        </div>
    );
}

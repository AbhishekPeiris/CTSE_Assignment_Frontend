import { useCallback, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Loader from "../../../components/ui/Loader";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import StatusPill from "../../../components/ui/StatusPill";
import { OrderService } from "../../../services/order.service";
import { ORDER_STATUS_OPTIONS } from "../../../utils/constants";
import { asEntity, formatDate, formatMoney, resolveRole, toPrettyJSON } from "../../../utils/helpers";
import { useAppContext } from "../../../app/providers/AppProvider";

export default function OrderDetails() {
  const { id } = useParams();
  const { auth } = useAppContext();
  const role = resolveRole(auth?.user);
  const canUpdateOrderStatus = role === "ADMIN" || role === "DELIVERY";

  const [state, setState] = useState({ loading: true, error: "", order: null });
  const [statusDraft, setStatusDraft] = useState("PENDING");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadOrder = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await OrderService.getOrderById(id);
      const order = asEntity(response, ["order"]);

      setState({ loading: false, error: "", order });
      setStatusDraft(String(order?.status || "PENDING").toUpperCase());
    } catch (error) {
      setState({
        loading: false,
        error: error?.friendlyMessage || error?.message || "Failed to load order",
        order: null,
      });
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleUpdateStatus = async () => {
    setActionLoading(true);
    setActionError("");

    try {
      await OrderService.updateOrderStatus(id, statusDraft);
      await loadOrder();
    } catch (error) {
      setActionError(error?.friendlyMessage || error?.message || "Failed to update order status");
    } finally {
      setActionLoading(false);
    }
  };

  if (state.loading) {
    return <Loader text="Loading order..." />;
  }

  return (
    <Card title="Order Details" subtitle="Detailed order payload and status operations">
      <div className="mb-5">
        <NavLink to="/orders">
          <Button variant="secondary" size="sm">
            Back to Orders
          </Button>
        </NavLink>
      </div>

      <ErrorMessage message={state.error} />
      <ErrorMessage message={actionError} />

      {state.order ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl font-semibold text-[#1f2937]">
              {state.order?._id || state.order?.id || "Order"}
            </h3>
            <StatusPill status={state.order?.status || "PENDING"} />
          </div>

          <div className="grid gap-3 rounded-xl border border-[#edf0f7] bg-[#fcfdff] p-4 md:grid-cols-2">
            <p className="text-sm text-[#3c4043]">
              User: {state.order?.userId || state.order?.user?._id || state.order?.user?.id || "N/A"}
            </p>
            <p className="text-sm text-[#3c4043]">
              Total: {formatMoney(state.order?.totalAmount || state.order?.amount || state.order?.total)}
            </p>
            <p className="text-sm text-[#3c4043]">Created: {formatDate(state.order?.createdAt)}</p>
            <p className="text-sm text-[#3c4043]">Items: {state.order?.items?.length || 0}</p>
          </div>

          {canUpdateOrderStatus ? (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusDraft}
                onChange={(event) => setStatusDraft(event.target.value)}
                className="rounded-lg border border-[#d9dde8] bg-white px-3 py-2 text-sm text-[#1f2937] outline-none focus:border-[#1a73e8]"
              >
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <Button onClick={handleUpdateStatus} disabled={actionLoading}>
                {actionLoading ? "Updating..." : "Update Status"}
              </Button>
            </div>
          ) : null}

          <pre className="overflow-x-auto rounded-xl border border-[#edf0f7] bg-[#fafcff] p-3 text-xs text-[#334155]">
            {toPrettyJSON(state.order)}
          </pre>
        </div>
      ) : null}
    </Card>
  );
}

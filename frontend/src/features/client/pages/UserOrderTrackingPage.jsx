import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Loader from "../../../components/ui/Loader";
import StatusPill from "../../../components/ui/StatusPill";
import { OrderService } from "../../../services/order.service";
import { AuthService } from "../../../services/auth.service";
import { authStore } from "../../../app/store/authStore";
import { formatDate, formatMoney } from "../../../utils/helpers";

export default function UserOrderTrackingPage() {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { id } = useParams();

  const [state, setState] = useState({
    loading: true,
    error: "",
    order: null,
    tracking: null,
  });
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const loadData = useCallback(async () => {
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
        error:
          error?.friendlyMessage ||
          error?.message ||
          "Unable to load tracking information",
        order: null,
        tracking: null,
      });
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const orderStatus = String(state.order?.status || "").toUpperCase();
  const isPending = orderStatus === "PENDING";

  const handleCancelOrder = async () => {
    if (!id || !isPending) {
      return;
    }

    setCancelLoading(true);
    setActionMessage("");

    try {
      await OrderService.cancelOrder(id, cancelReason.trim());
      setActionMessage("Order cancelled successfully.");

      try {
        const me = await AuthService.getCurrentUser();
        authStore.updateUser(me);
      } catch (refreshError) {
        console.warn("Unable to refresh user after cancellation", refreshError);
      }

      await loadData();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error?.friendlyMessage || error?.message || "Failed to cancel order",
      }));
    } finally {
      setCancelLoading(false);
    }
  };

  if (state.loading) {
    return (
      <div className="mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6 lg:px-8">
        <Loader text="Loading order tracking..." />
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-64 bg-white pointer-events-none -z-10" />

      <div className="p-5 bg-white border rounded-3xl border-line ">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-wide uppercase text-word">
              Order tracking
            </p>
            <h1 className="text-2xl font-semibold text-[#0f172a]">{id}</h1>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="rounded-full border border-line] px-4 py-2 text-xs font-semibold text-word transition hover:bg-white"
          >
            Refresh
          </button>
        </div>

        <ErrorMessage message={state.error} />
        <ErrorMessage
          message={
            actionMessage ? { message: actionMessage, severity: "success" } : ""
          }
        />

        {state.order ? (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 bg-white border rounded-2xl border-line">
                <p className="text-xs tracking-wide uppercase text-word">
                  Order status
                </p>
                <div className="mt-2">
                  <StatusPill status={state.order.status} />
                </div>
                <p className="mt-2 text-sm text-word">
                  Created: {formatDate(state.order.createdAt)}
                </p>
                <p className="text-sm text-word">
                  Completed: {formatDate(state.order.completedAt)}
                </p>
              </div>

              <div className="p-4 bg-white border rounded-2xl border-line">
                <p className="text-xs tracking-wide uppercase text-word">
                  Payment & loyalty
                </p>
                <p className="mt-2 text-sm text-word">
                  Payment: {state.order.paymentMethod || "CASH_ON_DELIVERY"}
                </p>
                <p className="text-sm text-word">
                  Loyalty used: {state.order.loyaltyPointsUsed || 0}
                </p>
                <p className="text-sm font-semibold text-[#0f172a]">
                  Total: {formatMoney(state.order.totalAmount)}
                </p>
              </div>

              <div className="p-4 bg-white border rounded-2xl border-line sm:col-span-2 lg:col-span-1">
                <p className="text-xs tracking-wide uppercase text-word">
                  Delivery destination
                </p>
                <p className="mt-2 text-sm text-word">
                  {state.order.deliveryLocation?.address || "N/A"}
                </p>
                <p className="text-xs text-word">
                  {state.order.deliveryLocation?.latitude || "-"},{" "}
                  {state.order.deliveryLocation?.longitude || "-"}
                </p>
              </div>
            </div>

            <div className="p-4 bg-white border rounded-2xl border-line">
              <p className="text-xs tracking-wide uppercase text-word">
                Assigned delivery
              </p>
              {state.tracking?.deliveryAssignment?.deliveryUserId ? (
                <div className="mt-2 text-sm text-word">
                  <p>
                    Name:{" "}
                    {state.tracking?.deliveryAssignment?.deliveryUserName ||
                      "N/A"}
                  </p>
                  <p>
                    Delivery user id:{" "}
                    {state.tracking?.deliveryAssignment?.deliveryUserId}
                  </p>
                  <p>
                    Assigned at:{" "}
                    {formatDate(state.tracking?.deliveryAssignment?.assignedAt)}
                  </p>
                  <p className="flex items-center gap-2 mt-2">
                    <span>Delivery status:</span>
                    <StatusPill
                      status={
                        state.tracking?.delivery?.status ||
                        state.tracking?.orderStatus
                      }
                    />
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-word">
                  No delivery assignment yet.
                </p>
              )}
            </div>

            <div className="p-4 bg-white border rounded-2xl border-line">
              <p className="text-xs tracking-wide uppercase text-word">Items</p>
              <ul className="mt-2 space-y-1 text-sm text-word">
                {(state.order.items || []).map((item) => (
                  <li
                    key={`${item.productId}-${item.name}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <span>{item.name}</span>
                    <span>x {item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {isPending ? (
              <div className="p-4 bg-white border rounded-2xl border-line">
                <p className="text-xs uppercase tracking-wide text-[#7c2d12]">
                  User actions
                </p>
                <p className="mt-1 text-sm text-word">
                  This order is still pending. You can cancel it from this page.
                </p>

                <div className="mt-3 space-y-2">
                  <input
                    value={cancelReason}
                    onChange={(event) => setCancelReason(event.target.value)}
                    placeholder="Cancellation reason (optional)"
                    className="w-full px-3 py-2 text-sm bg-white border rounded-xl border-line text-label "
                  />
                  <button
                    type="button"
                    disabled={cancelLoading}
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-4 py-2 text-sm font-semibold text-white transition rounded-full bg-danger hover:bg-danger/80 disabled:opacity-50"
                  >
                    {cancelLoading ? "Cancelling..." : "Cancel this order"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5">
          <Link
            to="/my-orders"
            className="text-sm font-semibold underline text-success"
          >
            Back to my orders
          </Link>
        </div>
      </div>

      <Dialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "#fff",
            },
          },
        }}
      >
        <DialogTitle>Confirm order cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to cancel this pending order?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason (optional)"
            fullWidth
            multiline
            minRows={3}
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowCancelConfirm(false)}
            disabled={cancelLoading}
          >
            Close
          </Button>
          <Button
            onClick={async () => {
              await handleCancelOrder();
              setShowCancelConfirm(false);
            }}
            variant="contained"
            color="error"
            disabled={cancelLoading}
          >
            {cancelLoading ? "Processing..." : "Cancel order"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

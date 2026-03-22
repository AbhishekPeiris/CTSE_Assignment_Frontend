import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import {
  asCollection,
  formatDate,
  formatMoney,
  resolveEntityId,
} from "../../../utils/helpers";
import LocationPickerMap from "../../../components/layout/LocationPickerMap";

const CONFIRM_ACTIONS = {
  UPDATE_ORDER: "update-order",
  CANCEL_ORDER: "cancel-order",
};

function buildDraft(order) {
  return {
    items: (order?.items || []).map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
    })),
    deliveryLocation: {
      address: order?.deliveryLocation?.address || "",
      latitude: order?.deliveryLocation?.latitude || "",
      longitude: order?.deliveryLocation?.longitude || "",
    },
  };
}

export default function UserOrdersPage() {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [state, setState] = useState({ loading: true, error: "", orders: [] });
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const [editingOrderId, setEditingOrderId] = useState("");
  const [editDraft, setEditDraft] = useState(null);
  const [cancelReasonByOrder, setCancelReasonByOrder] = useState({});
  const [confirmState, setConfirmState] = useState({
    open: false,
    type: "",
    orderId: "",
  });

  const openConfirm = (type, orderId) => {
    setConfirmState({
      open: true,
      type,
      orderId,
    });
  };

  const closeConfirm = () => {
    setConfirmState({
      open: false,
      type: "",
      orderId: "",
    });
  };

  const loadOrders = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await OrderService.getMyOrders();
      const orders = asCollection(response, ["orders"]).sort((left, right) => {
        const leftTime = new Date(left?.createdAt || 0).getTime();
        const rightTime = new Date(right?.createdAt || 0).getTime();
        return rightTime - leftTime;
      });

      setState({ loading: false, error: "", orders });
    } catch (error) {
      setState({
        loading: false,
        error:
          error?.friendlyMessage ||
          error?.message ||
          "Unable to load your orders",
        orders: [],
      });
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const orders = state.orders;

  const pendingCount = useMemo(
    () =>
      orders.filter(
        (order) => String(order?.status || "").toUpperCase() === "PENDING",
      ).length,
    [orders],
  );

  const completedCount = useMemo(
    () =>
      orders.filter(
        (order) => String(order?.status || "").toUpperCase() === "COMPLETED",
      ).length,
    [orders],
  );

  const handleOpenEdit = (order) => {
    setEditingOrderId(resolveEntityId(order));
    setEditDraft(buildDraft(order));
    setActionError("");
    setActionSuccess("");
  };

  const handleDraftQuantity = (productId, quantity) => {
    setEditDraft((prev) => {
      if (!prev) {
        return prev;
      }

      const nextItems = prev.items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(0, Number(quantity || 0)) }
          : item,
      );

      return {
        ...prev,
        items: nextItems,
      };
    });
  };

  const handleDraftLocationChange = ({ latitude, longitude, locationName }) => {
    setEditDraft((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        deliveryLocation: {
          ...prev.deliveryLocation,
          latitude,
          longitude,
          address:
            typeof locationName === "string" && locationName.trim()
              ? locationName
              : prev.deliveryLocation.address,
        },
      };
    });
  };

  const handleSaveEdit = async (orderId) => {
    if (!editDraft) {
      return;
    }

    setActionError("");
    setActionSuccess("");

    const normalizedItems = editDraft.items
      .filter((item) => Number(item.quantity) > 0)
      .map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      }));

    if (!normalizedItems.length) {
      setActionError("At least one item quantity must be greater than 0.");
      return;
    }

    if (!editDraft.deliveryLocation.address.trim()) {
      setActionError("Delivery address is required.");
      return;
    }

    if (
      !editDraft.deliveryLocation.latitude ||
      !editDraft.deliveryLocation.longitude
    ) {
      setActionError("Please select a delivery location on the map.");
      return;
    }

    setActionLoading(`edit:${orderId}`);

    try {
      await OrderService.updatePendingOrder(orderId, {
        items: normalizedItems,
        deliveryLocation: {
          address: editDraft.deliveryLocation.address.trim(),
          latitude: Number(editDraft.deliveryLocation.latitude),
          longitude: Number(editDraft.deliveryLocation.longitude),
        },
      });

      setEditingOrderId("");
      setEditDraft(null);
      setActionSuccess("Pending order updated successfully.");
      await loadOrders();
    } catch (error) {
      setActionError(
        error?.friendlyMessage ||
        error?.message ||
        "Failed to update pending order",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleCancelOrder = async (orderId) => {
    setActionError("");
    setActionSuccess("");
    setActionLoading(`cancel:${orderId}`);

    try {
      const reason = (cancelReasonByOrder[orderId] || "").trim();
      await OrderService.cancelOrder(orderId, reason);
      setActionSuccess("Order cancelled successfully.");

      try {
        const me = await AuthService.getCurrentUser();
        authStore.updateUser(me);
      } catch (refreshError) {
        console.warn("Unable to refresh user after cancellation", refreshError);
      }

      await loadOrders();
    } catch (error) {
      setActionError(
        error?.friendlyMessage || error?.message || "Failed to cancel order",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleConfirmAction = async () => {
    const { orderId, type } = confirmState;

    if (!orderId) {
      closeConfirm();
      return;
    }

    if (type === CONFIRM_ACTIONS.UPDATE_ORDER) {
      await handleSaveEdit(orderId);
      closeConfirm();
      return;
    }

    if (type === CONFIRM_ACTIONS.CANCEL_ORDER) {
      await handleCancelOrder(orderId);
      closeConfirm();
    }
  };

  const isProcessingConfirmAction =
    (confirmState.type === CONFIRM_ACTIONS.UPDATE_ORDER &&
      actionLoading === `edit:${confirmState.orderId}`) ||
    (confirmState.type === CONFIRM_ACTIONS.CANCEL_ORDER &&
      actionLoading === `cancel:${confirmState.orderId}`);

  const confirmTitle =
    confirmState.type === CONFIRM_ACTIONS.UPDATE_ORDER
      ? "Confirm order update"
      : "Confirm order cancellation";

  const confirmDescription =
    confirmState.type === CONFIRM_ACTIONS.UPDATE_ORDER
      ? "Do you want to update this pending order with your current changes?"
      : "Do you want to cancel this pending order?";

  const confirmButtonLabel =
    confirmState.type === CONFIRM_ACTIONS.UPDATE_ORDER
      ? "Update order"
      : "Cancel order";

  return (
    <div className="relative mx-auto w-full max-w-[1180px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-64 bg-white pointer-events-none -z-10" />

      <div className="p-5 bg-white border rounded-3xl border-line">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-label">My Orders</h1>
            <p className="mt-1 text-sm text-word">
              Review, track, edit, and cancel pending orders.
            </p>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            className="px-4 py-2 text-xs font-semibold transition border rounded-full border-line text-word hover:bg-white"
          >
            Refresh
          </button>
        </div>

        <div className="grid gap-2 mt-4 sm:grid-cols-3">
          <div className="px-3 py-2 bg-white rounded-2xl gradient-border">
            <p className="text-[11px] uppercase tracking-wide text-word">
              Total
            </p>
            <p className="text-lg font-semibold text-label">
              {orders.length}
            </p>
          </div>
          <div className="px-3 py-2 bg-white rounded-2xl gradient-border">
            <p className="text-[11px] uppercase tracking-wide text-word">
              Pending
            </p>
            <p className="text-lg font-semibold text-word">
              {pendingCount}
            </p>
          </div>
          <div className="px-3 py-2 bg-white rounded-2xl gradient-border">
            <p className="text-[11px] uppercase tracking-wide text-word">
              Completed
            </p>
            <p className="text-lg font-semibold text-word">
              {completedCount}
            </p>
          </div>
        </div>
      </div>

      <ErrorMessage message={state.error} />
      <ErrorMessage message={actionError} />
      <ErrorMessage
        message={
          actionSuccess ? { message: actionSuccess, severity: "success" } : ""
        }
      />

      {state.loading ? <Loader text="Loading your orders..." /> : null}

      {state.loading || orders.length ? null : (
        <div className="p-6 mt-4 text-sm bg-white border rounded-2xl border-line text-word">
          No orders yet. Start shopping from{" "}
          <Link className="font-semibold underline text-success" to="/">
            home
          </Link>
          .
        </div>
      )}

      {state.loading ? null : (
        <div className="mt-4 space-y-4">
          {orders.map((order) => {
            const orderId = resolveEntityId(order);
            const status = String(order?.status || "PENDING").toUpperCase();
            const isPending = status === "PENDING";
            const isEditing = editingOrderId === orderId;

            return (
              <article
                key={orderId}
                className="p-5 bg-white border shadow-xl rounded-3xl border-line"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-wide uppercase text-word">
                      Order
                    </p>
                    <h2 className="text-lg font-semibold text-label">
                      {orderId}
                    </h2>
                    <p className="mt-1 text-xs text-word">
                      Placed on {formatDate(order?.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={status} />
                    <Link
                      to={`/orders/${orderId}/tracking`}
                      className="px-3 py-1 text-xs font-semibold transition border rounded-full border-line text-word hover:bg-white"
                    >
                      Track
                    </Link>
                  </div>
                </div>

                <div className="grid gap-3 mt-3 md:grid-cols-2">
                  <div className="p-3 bg-white border rounded-2xl border-line">
                    <p className="text-xs tracking-wide uppercase text-word">
                      Items
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-word">
                      {(order?.items || []).map((item) => (
                        <li
                          key={`${orderId}-${item.productId}`}
                          className="flex items-center justify-between gap-3"
                        >
                          <span>{item.name}</span>
                          <span>x {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 text-sm bg-white border rounded-2xl border-line text-word">
                    <p className="text-xs tracking-wide uppercase text-word">
                      Billing
                    </p>
                    <p className="mt-2">
                      Subtotal: {formatMoney(order?.subtotal)}
                    </p>
                    <p>Loyalty used: {order?.loyaltyPointsUsed || 0}</p>
                    <p>Total: {formatMoney(order?.totalAmount)}</p>
                    <p className="mt-2 text-xs text-word">
                      Payment: {order?.paymentMethod || "CASH_ON_DELIVERY"}
                    </p>
                  </div>
                </div>

                <div className="p-3 mt-3 text-sm bg-white border rounded-2xl border-line text-word">
                  <p className="text-xs tracking-wide uppercase text-word">
                    Delivery location
                  </p>
                  <p className="mt-1">
                    {order?.deliveryLocation?.address || "N/A"}
                  </p>
                  <p className="text-xs text-word">
                    {order?.deliveryLocation?.latitude || "-"},{" "}
                    {order?.deliveryLocation?.longitude || "-"}
                  </p>
                </div>

                {isPending ? (
                  <div className="p-3 mt-4 space-y-3 bg-white border rounded-2xl border-line">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          isEditing
                            ? setEditingOrderId("")
                            : handleOpenEdit(order)
                        }
                        className="px-3 py-1 text-xs font-semibold transition border rounded-full border-line text-word hover:bg-white"
                      >
                        {isEditing ? "Close Edit" : "Edit Pending Order"}
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading === `cancel:${orderId}`}
                        onClick={() =>
                          openConfirm(CONFIRM_ACTIONS.CANCEL_ORDER, orderId)
                        }
                        className="px-3 py-1 text-xs font-semibold text-white transition rounded-full bg-danger hover:bg-danger/80 disabled:opacity-50"
                      >
                        {actionLoading === `cancel:${orderId}`
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    </div>

                    <input
                      value={cancelReasonByOrder[orderId] || ""}
                      onChange={(event) =>
                        setCancelReasonByOrder((prev) => ({
                          ...prev,
                          [orderId]: event.target.value,
                        }))
                      }
                      placeholder="Cancellation reason (optional)"
                      className="w-full px-3 py-2 text-sm bg-white border rounded-xl border-line text-word"
                    />

                    {isEditing && editDraft ? (
                      <div className="p-3 space-y-3 bg-white border rounded-2xl border-line">
                        <p className="text-sm font-semibold text-word">
                          Edit items and location
                        </p>

                        <div className="space-y-2">
                          {editDraft.items.map((item) => (
                            <div
                              key={`${orderId}-${item.productId}`}
                              className="flex items-center justify-between gap-3"
                            >
                              <span className="text-sm text-word">
                                {item.name}
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={item.quantity}
                                onChange={(event) =>
                                  handleDraftQuantity(
                                    item.productId,
                                    event.target.value,
                                  )
                                }
                                className="w-24 px-2 py-1 text-sm border rounded-lg border-line text-word"
                              />
                            </div>
                          ))}
                        </div>

                        <textarea
                          rows={2}
                          value={editDraft.deliveryLocation.address}
                          onChange={(event) =>
                            setEditDraft((prev) => ({
                              ...prev,
                              deliveryLocation: {
                                ...prev.deliveryLocation,
                                address: event.target.value,
                              },
                            }))
                          }
                          placeholder="Delivery address"
                          className="w-full px-3 py-2 text-sm border rounded-xl border-line text-word"
                        />

                        <LocationPickerMap
                          latitude={editDraft.deliveryLocation.latitude}
                          longitude={editDraft.deliveryLocation.longitude}
                          onChange={handleDraftLocationChange}
                        />

                        {/* <p className="px-3 py-2 text-xs bg-white border rounded-xl border-line text-word">
                          Selected coordinates:{" "}
                          {editDraft.deliveryLocation.latitude || "-"},{" "}
                          {editDraft.deliveryLocation.longitude || "-"}
                        </p> */}

                        <button
                          type="button"
                          disabled={actionLoading === `edit:${orderId}`}
                          onClick={() =>
                            openConfirm(CONFIRM_ACTIONS.UPDATE_ORDER, orderId)
                          }
                          className="px-4 py-2 text-sm font-semibold text-white transition rounded-full bg-primary hover:bg-primary/80 disabled:opacity-50"
                        >
                          {actionLoading === `edit:${orderId}`
                            ? "Saving..."
                            : "Save Pending Order"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <Dialog
        open={confirmState.open}
        onClose={closeConfirm}
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
        <DialogTitle>{confirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDescription}</DialogContentText>
          {confirmState.type === CONFIRM_ACTIONS.CANCEL_ORDER ? (
            <TextField
              autoFocus
              margin="dense"
              label="Reason (optional)"
              fullWidth
              multiline
              minRows={3}
              value={cancelReasonByOrder[confirmState.orderId] || ""}
              onChange={(event) =>
                setCancelReasonByOrder((prev) => ({
                  ...prev,
                  [confirmState.orderId]: event.target.value,
                }))
              }
            />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm} disabled={isProcessingConfirmAction}>
            Close
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={
              confirmState.type === CONFIRM_ACTIONS.CANCEL_ORDER
                ? "error"
                : "primary"
            }
            disabled={isProcessingConfirmAction}
          >
            {isProcessingConfirmAction ? "Processing..." : confirmButtonLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

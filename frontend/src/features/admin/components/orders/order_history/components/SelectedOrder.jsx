import React from "react";
import PropTypes from "prop-types";
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
import ErrorMessage from "../../../../../../components/ui/ErrorMessage";
import Loader from "../../../../../../components/ui/Loader";
import StatusPill from "../../../../../../components/ui/StatusPill";
import {
  formatMoney,
  normalizeStatus,
  resolveEntityId,
} from "../../../../../../utils/helpers";

const ORDER_STATUS_OPTIONS_ADMIN = [
  "ASSIGNED",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED_BY_ADMIN",
  "CANCELLED_BY_DELIVERY",
];

const TERMINAL_STATUSES = new Set([
  "COMPLETED",
  "CANCELLED_BY_USER",
  "CANCELLED_BY_ADMIN",
  "CANCELLED_BY_DELIVERY",
]);

const TRACKING_STEPS = ["PENDING", "ASSIGNED", "OUT_FOR_DELIVERY", "COMPLETED"];

const CONFIRM_ACTIONS = {
  UPDATE_STATUS: "update-status",
  CANCEL_ORDER: "cancel-order",
  DELETE_ORDER: "delete-order",
};

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getDisplayName(order) {
  return order?.customerName || order?.user?.name || "Walk-in Customer";
}

function getDeliveryAssignment(order, tracking) {
  return tracking?.deliveryAssignment || order?.deliveryAssignment || null;
}

function getDeliveryStatus(order, tracking) {
  return String(
    tracking?.delivery?.status ||
      tracking?.orderStatus ||
      order?.status ||
      "PENDING",
  ).toUpperCase();
}

function getItemName(item) {
  return item?.name || item?.product?.name || item?.productName || "Product";
}

const SelectedOrder = ({
  selectedOrder,
  trackingState,
  orderStatusDrafts,
  setOrderStatusDrafts,
  handleOrderStatusUpdate,
  handleCancelOrderAsAdmin,
  handleDeleteOrder,
  actionLoading,
  customerNamesByOrderId,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [confirmState, setConfirmState] = React.useState({
    open: false,
    type: "",
    reason: "",
  });

  const openConfirm = (type) => {
    setConfirmState((prev) => ({
      ...prev,
      open: true,
      type,
      reason: type === CONFIRM_ACTIONS.CANCEL_ORDER ? prev.reason : "",
    }));
  };

  const closeConfirm = () => {
    setConfirmState({
      open: false,
      type: "",
      reason: "",
    });
  };

  const handleConfirmProceed = async () => {
    if (!selectedOrder) {
      closeConfirm();
      return;
    }

    if (confirmState.type === CONFIRM_ACTIONS.UPDATE_STATUS) {
      await handleOrderStatusUpdate(selectedOrder);
      closeConfirm();
      return;
    }

    if (confirmState.type === CONFIRM_ACTIONS.CANCEL_ORDER) {
      await handleCancelOrderAsAdmin(selectedOrder, confirmState.reason);
      closeConfirm();
      return;
    }

    if (confirmState.type === CONFIRM_ACTIONS.DELETE_ORDER) {
      await handleDeleteOrder(resolveEntityId(selectedOrder));
      closeConfirm();
    }
  };

  const getDialogTitle = () => {
    if (confirmState.type === CONFIRM_ACTIONS.UPDATE_STATUS) {
      return "Confirm status update";
    }

    if (confirmState.type === CONFIRM_ACTIONS.CANCEL_ORDER) {
      return "Confirm order cancellation";
    }

    if (confirmState.type === CONFIRM_ACTIONS.DELETE_ORDER) {
      return "Confirm permanent delete";
    }

    return "Confirm action";
  };

  const getDialogMessage = () => {
    if (confirmState.type === CONFIRM_ACTIONS.UPDATE_STATUS) {
      return "Do you want to update the order status?";
    }

    if (confirmState.type === CONFIRM_ACTIONS.CANCEL_ORDER) {
      return "Do you want to cancel this order as admin?";
    }

    if (confirmState.type === CONFIRM_ACTIONS.DELETE_ORDER) {
      return "This order will be deleted permanently. This action cannot be undone.";
    }

    return "Please confirm this action.";
  };

  const getConfirmButtonLabel = () => {
    if (confirmState.type === CONFIRM_ACTIONS.UPDATE_STATUS) {
      return "Update status";
    }

    if (confirmState.type === CONFIRM_ACTIONS.CANCEL_ORDER) {
      return "Cancel order";
    }

    if (confirmState.type === CONFIRM_ACTIONS.DELETE_ORDER) {
      return "Delete permanently";
    }

    return "Confirm";
  };

  const getConfirmButtonColor = () => {
    if (confirmState.type === CONFIRM_ACTIONS.DELETE_ORDER) {
      return "error";
    }

    if (confirmState.type === CONFIRM_ACTIONS.CANCEL_ORDER) {
      return "error";
    }

    return "primary";
  };

  const isProcessingAction =
    (confirmState.type === CONFIRM_ACTIONS.UPDATE_STATUS &&
      actionLoading === `status-order:${resolveEntityId(selectedOrder)}`) ||
    (confirmState.type === CONFIRM_ACTIONS.CANCEL_ORDER &&
      actionLoading === `cancel-order:${resolveEntityId(selectedOrder)}`) ||
    (confirmState.type === CONFIRM_ACTIONS.DELETE_ORDER &&
      actionLoading === `delete-order:${resolveEntityId(selectedOrder)}`);

  if (!selectedOrder) {
    return (
      <section className="bg-white p-5 xl:p-5">
        <div className="flex min-h-[520px] items-center justify-center rounded-2xl border-dashed border-line bg-white p-8 text-center text-sm text-word">
          Select an order from the left side to view full details and delivery
          tracking.
        </div>
      </section>
    );
  }

  const selectedOrderStatus = String(selectedOrder?.status || "").toUpperCase();
  const isTerminal = TERMINAL_STATUSES.has(selectedOrderStatus);
  const deliveryAssignment = getDeliveryAssignment(
    selectedOrder,
    trackingState.data,
  );
  const deliveryStatus = getDeliveryStatus(selectedOrder, trackingState.data);
  const selectedOrderId = resolveEntityId(selectedOrder);
  const displayName =
    customerNamesByOrderId[selectedOrderId] || getDisplayName(selectedOrder);

  return (
    <section className="bg-white p-5 xl:p-5">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-word">Selected order</p>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-label">
                {displayName}
              </h3>
              <StatusPill status={selectedOrder.status} />
            </div>
            <p className="mt-2 text-xs text-word">
              Order ID #{selectedOrderId} • Created{" "}
              {formatDateTime(selectedOrder.createdAt)}
            </p>
            <p className="mt-1 text-xs text-word">
              Customer phone:{" "}
              {selectedOrder.userContactNumber || "Not available"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[320px]">
            <div className="rounded-2xl border border-line bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Total
              </p>
              <p className="mt-2 text-xl font-semibold text-label">
                {formatMoney(selectedOrder.totalAmount || 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-success">
                Loyalty used
              </p>
              <p className="mt-2 text-2xl font-semibold text-label">
                {selectedOrder.loyaltyPointsUsed || 0}
              </p>
            </div>
          </div>
        </div>

        <ErrorMessage message={trackingState.error} />

        <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-word">
                    Status timeline
                  </p>
                  <p className="mt-1 text-sm font-semibold text-label">
                    Order and delivery progress
                  </p>
                </div>
                {trackingState.loading ? (
                  <Loader text="Loading tracking..." />
                ) : null}
              </div>

              <div className="mt-5 space-y-4">
                {TRACKING_STEPS.map((step, index) => {
                  const currentIndex = TRACKING_STEPS.indexOf(deliveryStatus);
                  const active = currentIndex >= index;
                  const timestamp =
                    step === "PENDING"
                      ? selectedOrder.createdAt
                      : step === "ASSIGNED"
                        ? deliveryAssignment?.assignedAt
                        : step === "OUT_FOR_DELIVERY"
                          ? trackingState.data?.delivery?.updatedAt
                          : selectedOrder.completedAt ||
                            trackingState.data?.delivery?.updatedAt;

                  return (
                    <div key={step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={[
                            "flex h-4 w-4 rounded-full border-2",
                            active
                              ? "border-success bg-success"
                              : "border-primary bg-white",
                          ].join(" ")}
                        />
                        {index === TRACKING_STEPS.length - 1 ? null : (
                          <span
                            className={[
                              "mt-1 h-10 w-px",
                              active ? "bg-success" : "bg-line",
                            ].join(" ")}
                          />
                        )}
                      </div>
                      <div className="pb-2">
                        <p className="text-sm font-semibold text-label">
                          {normalizeStatus(step)}
                        </p>
                        <p className="mt-1 text-xs text-word">
                          {formatDateTime(timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {selectedOrderStatus.startsWith("CANCELLED") ? (
                  <div className="rounded-2xl border border-line bg-white px-4 py-3">
                    <p className="text-sm font-semibold text-[#b91c1c]">
                      {normalizeStatus(selectedOrderStatus)}
                    </p>
                    <p className="mt-1 text-sm text-[#7f1d1d]">
                      This order is in a terminal state.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-word">
                    Order items
                  </p>
                  <p className="mt-1 text-xs font-semibold text-label">
                    {selectedOrder.items?.length || 0} items in this order
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f8fafc] px-3 py-2 text-xs font-semibold text-word">
                  {selectedOrder.paymentMethod || "CASH_ON_DELIVERY"}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {(selectedOrder.items || []).map((item, index) => (
                  <div
                    key={`${item.productId || item._id || index}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-4"
                  >
                    {/* <div className="min-w-0">
                      <img
                        src={item.imageUrl || item.product?.imageUrl}
                        alt={getItemName(item)}
                        className="object-cover w-16 h-16 rounded-lg"
                      />
                    </div> */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-label">
                        {getItemName(item)}
                      </p>
                      <p className="mt-1 text-sm text-word">
                        Qty {item.quantity || 0}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#374151]">
                      {formatMoney(
                        Number(item.price || 0) * Number(item.quantity || 0),
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 border-t border-[#efeae2] pt-4 text-sm text-word">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-label">
                    {formatMoney(selectedOrder.subtotal || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Loyalty discount</span>
                  <span className="font-semibold text-[#166534]">
                    - {formatMoney(selectedOrder.loyaltyDiscount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[#efeae2] pt-3">
                  <span className="text-base font-semibold text-[#374151]">
                    Final total
                  </span>
                  <span className="text-2xl font-semibold tracking-[-0.03em] text-label">
                    {formatMoney(selectedOrder.totalAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-word">
                Delivery details
              </p>
              <div className="mt-2 grid gap-4">
                <div className="rounded-2xl border border-line bg-white p-4">
                  <p className="text-sm font-semibold text-label">
                    Delivery address
                  </p>
                  <p className="mt-2 text-sm leading-6 text-word">
                    {selectedOrder.deliveryLocation?.address ||
                      "No address provided"}
                  </p>
                  <p className="mt-2 text-xs text-word]">
                    {selectedOrder.deliveryLocation?.latitude || "-"},{" "}
                    {selectedOrder.deliveryLocation?.longitude || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-label">
                      Delivery tracking
                    </p>
                    <StatusPill status={deliveryStatus} />
                  </div>

                  {deliveryAssignment?.deliveryUserId ? (
                    <div className="mt-3 space-y-2 text-sm text-word">
                      <p>
                        Rider:{" "}
                        <span className="font-medium text-label">
                          {deliveryAssignment.deliveryUserName ||
                            "Assigned delivery user"}
                        </span>
                      </p>
                      <p>
                        Delivery user ID: {deliveryAssignment.deliveryUserId}
                      </p>
                      <p>
                        Assigned at:{" "}
                        {formatDateTime(deliveryAssignment.assignedAt)}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-word">
                      No delivery assignment is attached to this order yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-word">
                Admin actions
              </p>
              <div className="mt-4 space-y-3">
                <select
                  value={orderStatusDrafts[selectedOrderId] || ""}
                  onChange={(event) =>
                    setOrderStatusDrafts((prev) => ({
                      ...prev,
                      [selectedOrderId]: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-label"
                >
                  <option value="">Set new status</option>
                  {ORDER_STATUS_OPTIONS_ADMIN.map((option) => (
                    <option key={option} value={option}>
                      {normalizeStatus(option)}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => openConfirm(CONFIRM_ACTIONS.UPDATE_STATUS)}
                  disabled={
                    isTerminal ||
                    actionLoading === `status-order:${selectedOrderId}`
                  }
                  className="w-full rounded-full shadow-lg bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-primary/80 disabled:opacity-50"
                >
                  {actionLoading === `status-order:${selectedOrderId}`
                    ? "Updating status..."
                    : "Update order status"}
                </button>

                <button
                  type="button"
                  onClick={() => openConfirm(CONFIRM_ACTIONS.CANCEL_ORDER)}
                  disabled={
                    isTerminal ||
                    actionLoading === `cancel-order:${selectedOrderId}`
                  }
                  className="w-full rounded-full shadow-lg bg-danger px-4 py-3 text-sm font-medium text-white transition hover:bg-danger/80 disabled:opacity-50"
                >
                  {actionLoading === `cancel-order:${selectedOrderId}`
                    ? "Cancelling order..."
                    : "Cancel order as admin"}
                </button>

                <button
                  type="button"
                  onClick={() => openConfirm(CONFIRM_ACTIONS.DELETE_ORDER)}
                  disabled={actionLoading === `delete-order:${selectedOrderId}`}
                  className="w-full rounded-full px-4 py-3 text-sm font-medium text-danger transition disabled:opacity-50"
                >
                  {actionLoading === `delete-order:${selectedOrderId}`
                    ? "Deleting..."
                    : "Delete permanently"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={confirmState.open}
        onClose={closeConfirm}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            backgroundColor: "#fff",
          },
        }}
      >
        <DialogTitle>{getDialogTitle()}</DialogTitle>
        <DialogContent>
          <DialogContentText>{getDialogMessage()}</DialogContentText>
          {confirmState.type === CONFIRM_ACTIONS.CANCEL_ORDER ? (
            <TextField
              autoFocus
              margin="dense"
              label="Reason (optional)"
              fullWidth
              multiline
              minRows={3}
              value={confirmState.reason}
              onChange={(event) =>
                setConfirmState((prev) => ({
                  ...prev,
                  reason: event.target.value,
                }))
              }
            />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm} disabled={isProcessingAction}>
            Close
          </Button>
          <Button
            onClick={handleConfirmProceed}
            variant="contained"
            color={getConfirmButtonColor()}
            disabled={isProcessingAction}
          >
            {isProcessingAction ? "Processing..." : getConfirmButtonLabel()}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
};

SelectedOrder.propTypes = {
  selectedOrder: PropTypes.object,
  trackingState: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    data: PropTypes.object,
  }).isRequired,
  orderStatusDrafts: PropTypes.object.isRequired,
  setOrderStatusDrafts: PropTypes.func.isRequired,
  handleOrderStatusUpdate: PropTypes.func.isRequired,
  handleCancelOrderAsAdmin: PropTypes.func.isRequired,
  handleDeleteOrder: PropTypes.func.isRequired,
  actionLoading: PropTypes.string.isRequired,
  customerNamesByOrderId: PropTypes.object.isRequired,
};

SelectedOrder.defaultProps = {
  selectedOrder: null,
};

export default SelectedOrder;

import React from "react";
import PropTypes from "prop-types";
import LocationPickerMap from "../../../../../client/components/LocationPickerMap";
import { formatMoney } from "../../../../../../utils/helpers";

const OrderSection = ({
  orderForm,
  setOrderForm,
  orderCustomer,
  setOrderCustomer,
  handleLookupOrCreateOrderCustomer,
  handleCreateOrderByAdmin,
  actionLoading,
  subtotal,
  loyaltyBalance,
  loyaltyRedemptionValue,
  total,
  customerReady,
}) => {
  const handleCustomerFieldChange = (field, value) => {
    setOrderForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (
      (field === "customerContactNumber" &&
        value.trim() !== String(orderCustomer?.contactNumber || "").trim()) ||
      (field === "customerName" &&
        value.trim() !== String(orderCustomer?.name || "").trim())
    ) {
      setOrderCustomer(null);
    }
  };

  return (
    <div>
      <aside className="p-5 bg-white xl:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold tracking-[-0.03em] text-label">
              Order
            </h3>
            <p className="mt-1 text-sm text-[#8b95a7]">
              Verify customer loyalty, set delivery, and complete the order.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-word">
                Customer
              </p>
              <p className="mt-1 text-base font-semibold text-[#111827]">
                Lookup loyalty account
              </p>
            </div>
            <div
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold",
                customerReady
                  ? "bg-[#e8f8ee] text-[#166534]"
                  : "bg-[#fff1df] text-[#b45309]",
              ].join(" ")}
            >
              {customerReady ? "Verified" : "Pending"}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex gap-2 mb-4">
              <input
                value={orderForm.customerContactNumber}
                onChange={(event) =>
                  handleCustomerFieldChange(
                    "customerContactNumber",
                    event.target.value,
                  )
                }
                placeholder="Customer phone number"
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-[#111827]"
              />
              <input
                value={orderForm.customerName}
                onChange={(event) =>
                  handleCustomerFieldChange("customerName", event.target.value)
                }
                placeholder="Customer name for new account"
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-[#111827]"
              />
            </div>
            <button
              type="button"
              onClick={handleLookupOrCreateOrderCustomer}
              disabled={actionLoading === "order-customer-lookup"}
              className="w-full rounded-full bg-success px-4 py-3 text-sm font-semibold text-white transition hover:bg-success/80 disabled:opacity-50 shadow-lg"
            >
              {actionLoading === "order-customer-lookup"
                ? "Checking customer..."
                : "Lookup or create customer"}
            </button>
          </div>

          {orderCustomer ? (
            <div className="mt-4 rounded-2xl border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    {orderCustomer.name || "Walk-in Customer"}
                  </p>
                  <p className="mt-1 text-xs text-word">
                    {orderCustomer.contactNumber || "No contact number"}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#eff8f0] px-3 py-2 text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-success">
                    Loyalty{" "}
                    <span className="text-[#15803d]">
                      {loyaltyBalance} points
                    </span>
                  </p>
                </div>
              </div>
              {/* <div className="grid gap-3 mt-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f8fafc] px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#94a3b8]">
                    Card number
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#1f2937]">
                    {orderCustomer.loyaltyCardNumber ||
                      "Generated automatically"}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f8fafc] px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#94a3b8]">
                    Account status
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#1f2937]">
                    {orderCustomer.isActive === false ? "Inactive" : "Active"}
                  </p>
                </div>
              </div> */}
            </div>
          ) : null}
        </div>

        <div className="mt-3 space-y-3">
          {orderForm.items.length ? (
            orderForm.items.map((item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5"
              >
                <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="h-full w-full bg-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-word">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-[#6b7280]">
                    {formatMoney(item.price || 0)} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOrderForm((prev) => ({
                        ...prev,
                        items: prev.items.map((entry) =>
                          entry.productId === item.productId
                            ? {
                                ...entry,
                                quantity: Math.max(
                                  1,
                                  Number(entry.quantity || 1) - 1,
                                ),
                              }
                            : entry,
                        ),
                      }))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd4c7] text-sm font-semibold text-[#4b5563]"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(event) =>
                      setOrderForm((prev) => ({
                        ...prev,
                        items: prev.items.map((entry) =>
                          entry.productId === item.productId
                            ? {
                                ...entry,
                                quantity: Math.min(
                                  item.stock,
                                  Math.max(1, Number(event.target.value || 1)),
                                ),
                              }
                            : entry,
                        ),
                      }))
                    }
                    className="w-12 rounded-xl border border-line bg-white px-2 py-1.5 text-center text-sm font-semibold text-[#111827] outline-none focus:border-[#d6b27a]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setOrderForm((prev) => ({
                        ...prev,
                        items: prev.items.map((entry) =>
                          entry.productId === item.productId
                            ? {
                                ...entry,
                                quantity: Math.min(
                                  item.stock,
                                  Number(entry.quantity || 1) + 1,
                                ),
                              }
                            : entry,
                        ),
                      }))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd4c7] text-sm font-semibold text-[#4b5563]"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setOrderForm((prev) => ({
                        ...prev,
                        items: prev.items.filter(
                          (entry) => entry.productId !== item.productId,
                        ),
                      }))
                    }
                    className="ml-1 rounded-full bg-warning px-3 py-1.5 text-xs font-normal text-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-white p-5 text-sm text-[#8b95a7]">
              Select products from the center panel to build the order.
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-word">
            Delivery details
          </p>
          <div className="mt-3 rounded-2xl border border-line bg-[#f8fafc] px-4 py-3 text-sm text-[#111827]">
            {orderForm.deliveryAddress ||
              "Select a location from the map search"}
          </div>
          <div className="mt-4 overflow-hidden rounded-[24px]">
            <LocationPickerMap
              latitude={orderForm.latitude}
              longitude={orderForm.longitude}
              onChange={({ latitude, longitude, locationName }) =>
                setOrderForm((prev) => ({
                  ...prev,
                  latitude,
                  longitude,
                  deliveryAddress:
                    locationName ||
                    prev.deliveryAddress ||
                    "Selected map location",
                }))
              }
            />
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-line bg-[#fffdfa] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between text-sm text-[#6b7280]">
            <span>Subtotal</span>
            <span className="font-semibold text-[#111827]">
              {formatMoney(subtotal)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <input
              type="number"
              min="0"
              max={loyaltyBalance}
              value={orderForm.loyaltyPointsToUse}
              onChange={(event) =>
                setOrderForm((prev) => ({
                  ...prev,
                  loyaltyPointsToUse: event.target.value,
                }))
              }
              placeholder="Loyalty points"
              className="w-32 rounded-2xl border border-line bg-white px-4 py-3 text-sm text-[#111827]"
            />
            <p className="text-sm text-[#6b7280]">
              Available: <span className="font-semibold">{loyaltyBalance}</span>
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-[#6b7280]">
            <span>Loyalty redemption</span>
            <span className="font-semibold text-[#166534]">
              - {formatMoney(loyaltyRedemptionValue)}
            </span>
          </div>
          <div className="mt-4 border-t border-[#efeae2] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-[#374151]">
                Total
              </span>
              <span className="text-[26px] font-semibold tracking-[-0.03em] text-[#111827]">
                {formatMoney(total)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreateOrderByAdmin}
            disabled={actionLoading === "create-admin-order"}
            className="mt-5 w-full rounded-[22px] bg-[#8f8a83] px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#7e786f] disabled:opacity-50"
          >
            {actionLoading === "create-admin-order"
              ? "Creating order..."
              : "Place customer order"}
          </button>
        </div>
      </aside>
    </div>
  );
};

OrderSection.propTypes = {
  orderForm: PropTypes.object.isRequired,
  setOrderForm: PropTypes.func.isRequired,
  orderCustomer: PropTypes.object,
  setOrderCustomer: PropTypes.func.isRequired,
  handleLookupOrCreateOrderCustomer: PropTypes.func.isRequired,
  handleCreateOrderByAdmin: PropTypes.func.isRequired,
  actionLoading: PropTypes.string.isRequired,
  subtotal: PropTypes.number.isRequired,
  loyaltyBalance: PropTypes.number.isRequired,
  loyaltyRedemptionValue: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  customerReady: PropTypes.bool.isRequired,
};

OrderSection.defaultProps = {
  orderCustomer: null,
};

export default OrderSection;

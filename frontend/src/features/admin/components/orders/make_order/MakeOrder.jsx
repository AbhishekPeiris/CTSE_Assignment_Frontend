import React from "react";
import PropTypes from "prop-types";
import LocationPickerMap from "../../../../client/components/LocationPickerMap";

const MakeOrder = ({
  orderForm,
  setOrderForm,
  products,
  handleAddItemToOrderDraft,
  handleCreateOrderByAdmin,
  actionLoading,
}) => {
  return (
    <div className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
      <p className="text-sm font-semibold text-[#0f172a]">
        Create order as admin
      </p>
      <div className="grid gap-2 mt-3 md:grid-cols-2">
        <input
          value={orderForm.customerContactNumber}
          onChange={(event) =>
            setOrderForm((prev) => ({
              ...prev,
              customerContactNumber: event.target.value,
            }))
          }
          placeholder="Customer contact number"
          className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
        />
        <input
          value={orderForm.customerName}
          onChange={(event) =>
            setOrderForm((prev) => ({
              ...prev,
              customerName: event.target.value,
            }))
          }
          placeholder="Customer name (optional)"
          className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
        />
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-[minmax(220px,1fr)_120px_auto]">
        <select
          value={orderForm.selectedProductId}
          onChange={(event) =>
            setOrderForm((prev) => ({
              ...prev,
              selectedProductId: event.target.value,
            }))
          }
          className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
        >
          <option value="">Select product</option>
          {products.map((product) => (
            <option
              key={product._id || product.id}
              value={product._id || product.id}
            >
              {product.name} (stock: {product.stock})
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          value={orderForm.selectedQuantity}
          onChange={(event) =>
            setOrderForm((prev) => ({
              ...prev,
              selectedQuantity: event.target.value,
            }))
          }
          className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleAddItemToOrderDraft}
          className="rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold text-white"
        >
          Add item
        </button>
      </div>
      {orderForm.items && orderForm.items.length ? (
        <div className="mt-3 rounded-xl border border-[#e5edf8] bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-[#64748b]">
            Draft items
          </p>
          <div className="mt-2 space-y-2">
            {orderForm.items.map((item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="grid gap-2 md:grid-cols-[1fr_120px_auto]"
              >
                <p className="text-sm text-[#334155]">{item.name}</p>
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
                              quantity: Math.max(
                                1,
                                Number(event.target.value || 1),
                              ),
                            }
                          : entry,
                      ),
                    }))
                  }
                  className="rounded-lg border border-[#d4dce9] px-2 py-1 text-sm"
                />
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
                  className="rounded-full border border-[#d4dce9] px-3 py-1 text-xs font-semibold text-[#334155]"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="grid gap-2 mt-3 md:grid-cols-2">
        <textarea
          rows={2}
          value={orderForm.deliveryAddress}
          onChange={(event) =>
            setOrderForm((prev) => ({
              ...prev,
              deliveryAddress: event.target.value,
            }))
          }
          placeholder="Delivery address"
          className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm md:col-span-2"
        />
        <input
          type="number"
          step="any"
          value={orderForm.latitude}
          onChange={(event) =>
            setOrderForm((prev) => ({
              ...prev,
              latitude: event.target.value,
            }))
          }
          placeholder="Latitude"
          className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
        />
        <input
          type="number"
          step="any"
          value={orderForm.longitude}
          onChange={(event) =>
            setOrderForm((prev) => ({
              ...prev,
              longitude: event.target.value,
            }))
          }
          placeholder="Longitude"
          className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
        />
      </div>
      <div className="mt-3">
        <LocationPickerMap
          latitude={orderForm.latitude}
          longitude={orderForm.longitude}
          onChange={({ latitude, longitude }) =>
            setOrderForm((prev) => ({
              ...prev,
              latitude,
              longitude,
            }))
          }
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <input
          type="number"
          min="0"
          value={orderForm.loyaltyPointsToUse}
          onChange={(event) =>
            setOrderForm((prev) => ({
              ...prev,
              loyaltyPointsToUse: event.target.value,
            }))
          }
          placeholder="Loyalty points to use"
          className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleCreateOrderByAdmin}
          disabled={actionLoading === "create-admin-order"}
          className="rounded-full bg-[#0f766e] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#115e59] disabled:opacity-50"
        >
          {actionLoading === "create-admin-order"
            ? "Creating..."
            : "Create Order"}
        </button>
      </div>
    </div>
  );
};

MakeOrder.propTypes = {
  orderForm: PropTypes.object.isRequired,
  setOrderForm: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
  handleAddItemToOrderDraft: PropTypes.func.isRequired,
  handleCreateOrderByAdmin: PropTypes.func.isRequired,
  actionLoading: PropTypes.string.isRequired,
};

export default MakeOrder;

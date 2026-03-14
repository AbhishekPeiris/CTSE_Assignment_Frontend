import React from "react";
import PropTypes from "prop-types";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";

const OrderSummary = ({
  cartSummary,
  cartItems,
  formatMoney,
  removeCartItem,
  updateCartQuantity,
  customerDetails,
  handleCustomerChange,
  customPayload,
  setCustomPayload,
  handleCreateOrder,
  clearOrderDesk,
  createLoading,
}) => (
  <aside className="rounded-[24px] bg-white p-4 text-label lg:p-5">
    <div className="rounded-[22px] border border-line bg-white/6 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-label">
        Active Ticket
      </p>
      <div className="grid gap-3 mt-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <div className="px-4 py-3 rounded-2xl bg-black/10">
          <p className="text-xs uppercase tracking-[0.18em] text-word">
            Lines
          </p>
          <p className="mt-2 text-sm font-semibold">{cartSummary.itemCount}</p>
        </div>
        <div className="px-4 py-3 rounded-2xl bg-black/10">
          <p className="text-xs uppercase tracking-[0.18em] text-word">
            Units
          </p>
          <p className="mt-2 text-sm font-semibold">{cartSummary.units}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 px-4 py-3 text-[#2d2413]">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6b5221]">
            Subtotal
          </p>
          <p className="mt-2 text-sm font-semibold">
            {formatMoney(cartSummary.subtotal)}
          </p>
        </div>
      </div>
    </div>
    <form onSubmit={handleCreateOrder} className="mt-5 space-y-4">
      <div className="rounded-[22px] border border-line bg-white/6 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-md">Admin Order Desk</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={clearOrderDesk}
            className="border rounded-full text-label border-line hover:bg-gray-50"
          >
            Clear
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-linepx-4 py-8 text-center text-sm text-word]">
              No products selected yet. Add products from the catalog to start
              the order.
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.productId}
                className="p-4 border bg-success rounded-2xl border-line"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                            <p className="text-sm font-semibold text-warning">
                      {item.name}
                    </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white">
                      {item.category}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCartItem(item.productId)}
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-200 transition hover:text-label"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                  <div className="px-3 py-1 text-xs text-white border rounded-full border-line">
                    {item.status}
                  </div>
                  <div className="flex items-center gap-2 p-1 border rounded-full border-line bg-black/5">
                    <button
                      type="button"
                      onClick={() =>
                        updateCartQuantity(item.productId, item.quantity - 1)
                      }
                                className="w-8 h-8 text-lg text-white transition rounded-full hover:bg-warning/90"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        updateCartQuantity(item.productId, event.target.value)
                      }
                      className="w-16 text-sm font-semibold text-center text-white bg-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateCartQuantity(item.productId, item.quantity + 1)
                      }
                                className="w-8 h-8 text-lg text-white transition rounded-full hover:bg-warning"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
                  <span>{formatMoney(item.price)} each</span>
                  <span className="font-semibold text-white">
                    {formatMoney(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="rounded-[22px] border border-line bg-white/6 p-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-label">
          Customer Context
        </h4>
        <div className="grid gap-3 mt-4">
          <Input
            label="Customer name"
            name="customerName"
            value={customerDetails.customerName}
            onChange={handleCustomerChange}
            placeholder="Order label for staff"
            inputClassName="rounded-2xl border-line bg-white/8 px-4 py-3 text-label placeholder:text-[#9db2a6]"
            className="[&>label]:text-word"
          />
          <Input
            label="Contact number"
            name="contactNumber"
            value={customerDetails.contactNumber}
            onChange={handleCustomerChange}
            placeholder="Optional contact"
            inputClassName="rounded-2xl border-line bg-white/8 px-4 py-3 text-label placeholder:text-[#9db2a6]"
            className="[&>label]:text-word"
          />
          <div>
            <label
              htmlFor="order-note"
              className="block mb-1 text-sm font-medium text-word"
            >
              Order note
            </label>
            <textarea
              id="order-note"
              name="orderNote"
              rows={3}
              value={customerDetails.orderNote}
              onChange={handleCustomerChange}
              placeholder="Packing notes, pickup instructions, customer purpose"
              className="w-full rounded-2xl border border-line bg-white/8 px-4 py-3 text-sm text-label outline-none transition placeholder:text-[#9db2a6]"
            />
          </div>
        </div>
      </div>
      <div className="rounded-[22px] border border-line bg-white/6 p-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-label">
          Advanced Payload
        </h4>
        <p className="mt-2 text-sm text-[#54645d]">
          Optional. Add extra API fields as JSON. If you provide `items`, that
          custom list will be used.
        </p>
        <textarea
          id="order-custom-payload"
          name="customPayload"
          rows={4}
          value={customPayload}
          onChange={(event) => setCustomPayload(event.target.value)}
          placeholder='{"customerId":"...", "priority":"HIGH"}'
          className="mt-3 w-full rounded-2xl border border-line bg-white/8 px-4 py-3 text-sm text-label outline-none transition placeholder:text-[#9db2a6]"
        />
      </div>
      <Button
        type="submit"
        disabled={createLoading || cartItems.length === 0}
        className="w-full px-5 py-3 text-sm font-semibold text-white rounded-full shadow-none bg-primary hover:bg-primary/80"
      >
        {createLoading ? "Creating order..." : "Create customer order"}
      </Button>
    </form>
  </aside>
);

OrderSummary.propTypes = {
  cartSummary: PropTypes.object.isRequired,
  cartItems: PropTypes.array.isRequired,
  formatMoney: PropTypes.func.isRequired,
  removeCartItem: PropTypes.func.isRequired,
  updateCartQuantity: PropTypes.func.isRequired,
  customerDetails: PropTypes.object.isRequired,
  handleCustomerChange: PropTypes.func.isRequired,
  customPayload: PropTypes.string.isRequired,
  setCustomPayload: PropTypes.func.isRequired,
  handleCreateOrder: PropTypes.func.isRequired,
  clearOrderDesk: PropTypes.func.isRequired,
  createLoading: PropTypes.bool.isRequired,
};

export default OrderSummary;

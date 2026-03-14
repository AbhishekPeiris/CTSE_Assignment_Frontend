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
  <aside className="rounded-[24px] bg-[#1a3227] p-4 text-white lg:p-5">
    <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c9d8cf]">
        Active Ticket
      </p>
      <div className="grid gap-3 mt-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <div className="px-4 py-3 rounded-2xl bg-white/10">
          <p className="text-xs uppercase tracking-[0.18em] text-[#bdd0c4]">
            Lines
          </p>
          <p className="mt-2 text-2xl font-semibold">{cartSummary.itemCount}</p>
        </div>
        <div className="px-4 py-3 rounded-2xl bg-white/10">
          <p className="text-xs uppercase tracking-[0.18em] text-[#bdd0c4]">
            Units
          </p>
          <p className="mt-2 text-2xl font-semibold">{cartSummary.units}</p>
        </div>
        <div className="rounded-2xl bg-[#f3c96b] px-4 py-3 text-[#2d2413]">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6b5221]">
            Subtotal
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {formatMoney(cartSummary.subtotal)}
          </p>
        </div>
      </div>
    </div>
    <form onSubmit={handleCreateOrder} className="mt-5 space-y-4">
      <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Admin Order Desk</h3>
            <p className="mt-1 text-sm text-[#c6d3cb]">
              Build the customer order, review each selected item, then submit.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={clearOrderDesk}
            className="px-4 py-2 text-white border rounded-2xl border-white/15 hover:bg-white/10"
          >
            Clear
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-[#cad7d0]">
              No products selected yet. Add products from the catalog to start
              the order.
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.productId}
                className="rounded-2xl border border-white/10 bg-[#223d31] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#a7beb1]">
                      {item.category}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCartItem(item.productId)}
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ffb4b4] transition hover:text-white"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                  <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#cbd7d1]">
                    {item.status}
                  </div>
                  <div className="flex items-center gap-2 p-1 border rounded-full border-white/10 bg-white/5">
                    <button
                      type="button"
                      onClick={() =>
                        updateCartQuantity(item.productId, item.quantity - 1)
                      }
                      className="w-8 h-8 text-lg text-white transition rounded-full hover:bg-white/10"
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
                      className="w-8 h-8 text-lg text-white transition rounded-full hover:bg-white/10"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-[#c6d3cb]">
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
      <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d4e0d9]">
          Customer Context
        </h4>
        <div className="grid gap-3 mt-4">
          <Input
            label="Customer name"
            name="customerName"
            value={customerDetails.customerName}
            onChange={handleCustomerChange}
            placeholder="Order label for staff"
            inputClassName="rounded-2xl border-white/10 bg-white/8 px-4 py-3 text-white placeholder:text-[#9db2a6]"
            className="[&>label]:text-[#dce7e0]"
          />
          <Input
            label="Contact number"
            name="contactNumber"
            value={customerDetails.contactNumber}
            onChange={handleCustomerChange}
            placeholder="Optional contact"
            inputClassName="rounded-2xl border-white/10 bg-white/8 px-4 py-3 text-white placeholder:text-[#9db2a6]"
            className="[&>label]:text-[#dce7e0]"
          />
          <div>
            <label
              htmlFor="order-note"
              className="mb-1 block text-sm font-medium text-[#dce7e0]"
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
              className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#9db2a6] focus:border-[#86bf9f] focus:ring-2 focus:ring-[#284d3c]"
            />
          </div>
        </div>
      </div>
      <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d4e0d9]">
          Advanced Payload
        </h4>
        <p className="mt-2 text-sm text-[#c6d3cb]">
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
          className="mt-3 w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#9db2a6] focus:border-[#86bf9f] focus:ring-2 focus:ring-[#284d3c]"
        />
      </div>
      <Button
        type="submit"
        disabled={createLoading || cartItems.length === 0}
        className="w-full rounded-2xl bg-[#f3c96b] px-5 py-3 text-sm font-semibold text-[#2d2413] shadow-none hover:bg-[#e7bb59]"
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

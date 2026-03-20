import React from "react";
import PropTypes from "prop-types";
import Button from "../../../../components/ui/Button";
import ErrorMessage from "../../../../components/ui/ErrorMessage";
import Input from "../../../../components/ui/Input";

const renderCustomerMeta = (customer) => {
  if (!customer) {
    return null;
  }

  return (
    <div className="mt-3 rounded-2xl border border-[#d7e4d9] bg-[#f4fbf4] p-4 text-sm text-[#204429]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{customer.name}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#56725d]">
            Registered loyalty customer
          </p>
        </div>
        <button
          type="button"
          onClick={customer.onClear}
          className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4b6351] transition hover:text-[#17341d]"
        >
          Clear
        </button>
      </div>
      <div className="grid gap-2 mt-3 sm:grid-cols-3">
        <div className="px-3 py-2 bg-white rounded-2xl">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6a7c6d]">
            Role
          </p>
          <p className="mt-1 font-semibold">{customer.role}</p>
        </div>
        <div className="px-3 py-2 bg-white rounded-2xl">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6a7c6d]">
            Phone
          </p>
          <p className="mt-1 font-semibold">{customer.phone || "N/A"}</p>
        </div>
        <div className="px-3 py-2 bg-white rounded-2xl">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6a7c6d]">
            Points
          </p>
          <p className="mt-1 font-semibold">{customer.points}</p>
        </div>
      </div>
    </div>
  );
};

const OrderSummary = ({
  cartSummary,
  cartItems,
  formatMoney,
  removeCartItem,
  updateCartQuantity,
  handleCreateOrder,
  clearOrderDesk,
  createLoading,
  customerDirectoryLoading,
  customerDirectoryError,
  customerSearch,
  setCustomerSearch,
  filteredCustomers,
  selectedCustomer,
  handleSelectCustomer,
  clearSelectedCustomer,
  reloadCustomers,
  loyaltyPointsInput,
  setLoyaltyPointsInput,
  loyaltyPreview,
  loyaltyForm,
  handleLoyaltyFormChange,
  handleCreateLoyaltyCustomer,
  loyaltyCreateLoading,
  loyaltyActionError,
  loyaltySuccessMessage,
  roleOptions,
}) => (
  <aside className="rounded-[24px] bg-white p-4 text-label lg:p-5">
    <div className="rounded-[22px] border border-line bg-white/6 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-label">
        Active Ticket
      </p>
      <div className="grid gap-3 mt-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <div className="px-4 py-3 rounded-2xl bg-black/10">
          <p className="text-xs uppercase tracking-[0.18em] text-word">Lines</p>
          <p className="mt-2 text-sm font-semibold">{cartSummary.itemCount}</p>
        </div>
        <div className="px-4 py-3 rounded-2xl bg-black/10">
          <p className="text-xs uppercase tracking-[0.18em] text-word">Units</p>
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
      {selectedCustomer ? (
        <div className="mt-3 rounded-2xl bg-[#f8fbff] px-4 py-3 text-sm text-[#28527a]">
          <div className="flex items-center justify-between gap-3">
            <span>Loyalty discount</span>
            <span className="font-semibold">
              -{formatMoney(loyaltyPreview.discountAmount)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-[#4f6d8c]">
            <span>
              {loyaltyPreview.pointsUsed} point(s) x {loyaltyPreview.rate}%
            </span>
            <span>{loyaltyPreview.discountPercent}% off</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 font-semibold text-[#173b5e]">
            <span>Total after loyalty</span>
            <span>{formatMoney(loyaltyPreview.total)}</span>
          </div>
        </div>
      ) : null}
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
            className="border rounded-full border-line text-label hover:bg-gray-50"
          >
            Clear
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="px-4 py-8 text-sm text-center border border-dashed rounded-2xl border-line text-word">
              No products selected yet. Add products from the catalog to start
              the order.
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.productId}
                className="p-4 border rounded-2xl border-line bg-success"
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
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-label">
            Loyalty Lookup
          </h4>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={reloadCustomers}
            disabled={customerDirectoryLoading}
            className="shadow-none"
          >
            {customerDirectoryLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
        <p className="mt-2 text-sm text-[#54645d]">
          Search registered users by name, phone, email, role, or id. Loyalty is
          optional for order creation.
        </p>
        <div className="mt-4">
          <Input
            label="Search registered customers"
            value={customerSearch}
            onChange={(event) => setCustomerSearch(event.target.value)}
            placeholder="Search by name, phone, email, role, or id"
            inputClassName="rounded-2xl border-line bg-white/8 px-4 py-3 text-label placeholder:text-[#9db2a6]"
            className="[&>label]:text-word"
          />
        </div>
        <ErrorMessage message={customerDirectoryError} />
        {renderCustomerMeta(
          selectedCustomer
            ? { ...selectedCustomer, onClear: clearSelectedCustomer }
            : null,
        )}
        <div className="mt-3 space-y-2">
          {filteredCustomers.length === 0 ? (
            <div className="px-4 py-4 text-sm border border-dashed rounded-2xl border-line text-word">
              No registered customers matched this search.
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => handleSelectCustomer(customer)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  selectedCustomer?.id === customer.id
                    ? "border-[#8cc0a1] bg-[#edf8f0]"
                    : "border-line bg-white hover:border-[#bdd6c7]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-label">
                      {customer.name}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-word">
                      {customer.role}
                    </p>
                  </div>
                  <div className="text-right text-xs text-[#6b7b74]">
                    <p>{customer.phone || "No phone"}</p>
                    <p className="mt-1">{customer.points} points</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[22px] border border-line bg-white/6 p-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-label">
          Loyalty Discount
        </h4>
        <p className="mt-2 text-sm text-[#54645d]">
          Apply customer points only if the customer wants to use them. Each
          point reduces the subtotal by {selectedCustomer?.role === "ADMIN"
            ? "5%"
            : selectedCustomer?.role === "DELIVERY"
              ? "3%"
              : "1%"} for the selected role.
        </p>
        <div className="grid gap-3 mt-4">
          <Input
            label="Points to apply"
            type="number"
            min="0"
            value={loyaltyPointsInput}
            onChange={(event) => setLoyaltyPointsInput(event.target.value)}
            disabled={!selectedCustomer}
            placeholder={selectedCustomer ? "Enter loyalty points" : "Select a customer first"}
            inputClassName="rounded-2xl border-line bg-white/8 px-4 py-3 text-label placeholder:text-[#9db2a6]"
            className="[&>label]:text-word"
          />
          {selectedCustomer ? (
            <div className="rounded-2xl bg-[#faf8ee] px-4 py-3 text-sm text-[#665a2f]">
              <div className="flex items-center justify-between gap-3">
                <span>Available points</span>
                <span className="font-semibold">
                  {loyaltyPreview.availablePoints}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 mt-2">
                <span>Role discount per point</span>
                <span className="font-semibold">{loyaltyPreview.rate}%</span>
              </div>
              <div className="flex items-center justify-between gap-3 mt-2">
                <span>Max points for this role</span>
                <span className="font-semibold">
                  {loyaltyPreview.maxPointsByRole || 0}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[22px] border border-line bg-white/6 p-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-label">
          Create Loyalty Customer
        </h4>
        <p className="mt-2 text-sm text-[#54645d]">
          If the customer is not registered yet, create a new loyalty customer
          here using name, phone number, and role.
        </p>
        <div className="grid gap-3 mt-4">
          <Input
            label="Customer name"
            name="name"
            value={loyaltyForm.name}
            onChange={handleLoyaltyFormChange}
            placeholder="Enter customer name"
            inputClassName="rounded-2xl border-line bg-white/8 px-4 py-3 text-label placeholder:text-[#9db2a6]"
            className="[&>label]:text-word"
          />
          <Input
            label="Phone number"
            name="phone"
            value={loyaltyForm.phone}
            onChange={handleLoyaltyFormChange}
            placeholder="Enter customer phone number"
            inputClassName="rounded-2xl border-line bg-white/8 px-4 py-3 text-label placeholder:text-[#9db2a6]"
            className="[&>label]:text-word"
          />
          <div>
            <label
              htmlFor="loyalty-role"
              className="block mb-1 text-sm font-medium text-word"
            >
              Customer role
            </label>
            <select
              id="loyalty-role"
              name="role"
              value={loyaltyForm.role}
              onChange={handleLoyaltyFormChange}
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-word outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc]"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <ErrorMessage message={loyaltyActionError} />
          {loyaltySuccessMessage ? (
            <div className="rounded-2xl border border-[#cce5d5] bg-[#effaf2] px-4 py-3 text-sm text-[#146c2e]">
              {loyaltySuccessMessage}
            </div>
          ) : null}
          <Button
            type="button"
            variant="success"
            onClick={handleCreateLoyaltyCustomer}
            disabled={loyaltyCreateLoading}
            className="w-full shadow-none bg-success"
          >
            {loyaltyCreateLoading
              ? "Creating loyalty customer..."
              : "Create loyalty customer"}
          </Button>
        </div>
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
  handleCreateOrder: PropTypes.func.isRequired,
  clearOrderDesk: PropTypes.func.isRequired,
  createLoading: PropTypes.bool.isRequired,
  customerDirectoryLoading: PropTypes.bool.isRequired,
  customerDirectoryError: PropTypes.string.isRequired,
  customerSearch: PropTypes.string.isRequired,
  setCustomerSearch: PropTypes.func.isRequired,
  filteredCustomers: PropTypes.array.isRequired,
  selectedCustomer: PropTypes.object,
  handleSelectCustomer: PropTypes.func.isRequired,
  clearSelectedCustomer: PropTypes.func.isRequired,
  reloadCustomers: PropTypes.func.isRequired,
  loyaltyPointsInput: PropTypes.string.isRequired,
  setLoyaltyPointsInput: PropTypes.func.isRequired,
  loyaltyPreview: PropTypes.object.isRequired,
  loyaltyForm: PropTypes.object.isRequired,
  handleLoyaltyFormChange: PropTypes.func.isRequired,
  handleCreateLoyaltyCustomer: PropTypes.func.isRequired,
  loyaltyCreateLoading: PropTypes.bool.isRequired,
  loyaltyActionError: PropTypes.string.isRequired,
  loyaltySuccessMessage: PropTypes.string.isRequired,
  roleOptions: PropTypes.array.isRequired,
};

OrderSummary.defaultProps = {
  selectedCustomer: null,
};

export default OrderSummary;

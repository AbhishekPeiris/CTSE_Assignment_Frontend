import React from "react";
import PropTypes from "prop-types";
import StatusPill from "../../../../../../components/ui/StatusPill";
import {
  formatDate,
  formatMoney,
  resolveEntityId,
} from "../../../../../../utils/helpers";

function getDisplayName(order) {
  return (
    order?.customerName ||
    order?.user?.name ||
    order?.deliveryAssignment?.deliveryUserName ||
    "Walk-in Customer"
  );
}

const ClientOrders = ({
  filteredOrders,
  selectedOrderId,
  setSelectedOrderId,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  normalizeRole,
}) => {
  return (
    <aside className="border-b border-[#efeae2] bg-[#fcfaf6] p-5 xl:border-b-0 xl:border-r">
      <div>
        <p className="text-sm font-medium text-[#9a8f7a]">Client orders</p>
        <h3 className="mt-1 text-[30px] font-semibold tracking-[-0.03em] text-[#111827]">
          Order history
        </h3>
        <p className="mt-2 text-sm text-[#8b95a7]">
          Search by order id, customer phone number, or delivery address.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search orders"
          className="w-full rounded-2xl border border-[#e4ddd2] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#d6b27a] focus:ring-2 focus:ring-[#fde7c5]"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-2xl border border-[#e4ddd2] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#d6b27a] focus:ring-2 focus:ring-[#fde7c5]"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="OUT_FOR_DELIVERY">Out for delivery</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED_BY_USER">Cancelled by user</option>
          <option value="CANCELLED_BY_ADMIN">Cancelled by admin</option>
          <option value="CANCELLED_BY_DELIVERY">Cancelled by delivery</option>
        </select>
      </div>

      <div className="mt-5 space-y-3">
        {filteredOrders.length ? (
          filteredOrders.map((order) => {
            const orderId = resolveEntityId(order);
            const active = orderId === selectedOrderId;
            const status = normalizeRole(order?.status);

            return (
              <button
                key={orderId}
                type="button"
                onClick={() => setSelectedOrderId(orderId)}
                className={[
                  "flex w-full items-start gap-3 rounded-[24px] border px-4 py-4 text-left transition",
                  active
                    ? "border-[#d7c1a1] bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
                    : "border-[#ece6dd] bg-[#fffdfa] hover:border-[#dccdb7] hover:bg-white",
                ].join(" ")}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#ede6dc,_#f8f5ef)] text-sm font-semibold text-[#7c6f60]">
                  #{String(orderId).slice(-2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-base font-semibold text-[#111827]">
                      {getDisplayName(order)}
                    </p>
                    <StatusPill status={status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-[#6b7280]">
                    {order?.userContactNumber || "No contact number"}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[#94a3b8]">
                    <span>{formatDate(order?.createdAt)}</span>
                    <span>{formatMoney(order?.totalAmount || 0)}</span>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="rounded-[24px] border border-dashed border-[#ddd4c7] bg-white p-5 text-sm text-[#8b95a7]">
            No orders match the current search or filter.
          </div>
        )}
      </div>
    </aside>
  );
};

ClientOrders.propTypes = {
  filteredOrders: PropTypes.array.isRequired,
  selectedOrderId: PropTypes.string.isRequired,
  setSelectedOrderId: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  setStatusFilter: PropTypes.func.isRequired,
  normalizeRole: PropTypes.func.isRequired,
};

export default ClientOrders;

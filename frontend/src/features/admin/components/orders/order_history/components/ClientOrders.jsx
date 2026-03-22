import React from "react";
import PropTypes from "prop-types";
import StatusPill from "../../../../../../components/ui/StatusPill";
import {
  formatDate,
  formatMoney,
  resolveEntityId,
} from "../../../../../../utils/helpers";

function getDisplayName(order) {
  return order?.customerName || order?.user?.name || "Walk-in Customer";
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
  customerNamesByOrderId,
}) => {
  return (
    <aside className="p-5 bg-white border-b border-line xl:border-b-0 xl:border-r">
      <div>
        <p className="text-sm font-medium text-word">Client orders</p>
        <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-label">
          Order history
        </h3>
      </div>

      <div className="mt-3 space-y-2">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search orders"
          className="w-full px-4 py-2 text-xs bg-white border rounded-xl border-line text-word"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full px-4 py-2 text-xs bg-white border rounded-xl border-line text-word"
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

      <div className="mt-3 space-y-2">
        {filteredOrders.length ? (
          filteredOrders.map((order) => {
            const orderId = resolveEntityId(order);
            const active = orderId === selectedOrderId;
            const status = normalizeRole(order?.status);
            const displayName =
              customerNamesByOrderId[orderId] || getDisplayName(order);

            return (
              <button
                key={orderId}
                type="button"
                onClick={() => setSelectedOrderId(orderId)}
                className={[
                  "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition",
                  active
                    ? "bg-white shadow-lg gradient-border"
                    : "border-line bg-white hover:bg-line/10",
                ].join(" ")}
              >
                {/* LEFT ID */}
                <div className="text-xs font-semibold shrink-0 text-label/50">
                  #{String(orderId).slice(-2)}
                </div>

                {/* RIGHT CONTENT */}
                <div className="flex flex-col flex-1 min-w-0">
                  {/* TOP ROW */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate text-word">
                      {displayName}
                    </p>
                    <StatusPill status={status} />
                  </div>

                  {/* PHONE */}
                  <p className="truncate text-xs text-word mt-0.5">
                    {order?.userContactNumber || "No contact number"}
                  </p>

                  {/* BOTTOM ROW */}
                  <div className="flex items-center justify-between mt-2 text-xs text-word">
                    <span>{formatDate(order?.createdAt)}</span>
                    <span className="font-medium text-word">
                      {formatMoney(order?.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-5 text-sm bg-white border border-dashed rounded-2xl border-line text-word">
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
  customerNamesByOrderId: PropTypes.object.isRequired,
};

export default ClientOrders;

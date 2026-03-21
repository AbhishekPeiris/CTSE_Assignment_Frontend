import StatusPill from "../../../../components/ui/StatusPill";
import { formatDate, resolveEntityId } from "../../../../utils/helpers";
import {
  DELIVERY_ALLOWED_STATUS_FOR_DELIVERY_ROLE,
  DELIVERY_STATUS_OPTIONS,
} from "../../../../utils/constants";

const DeliveryManagement = ({
  deliveryAssignForm,
  setDeliveryAssignForm,
  deliveryUsers,
  handleCreateDelivery,
  actionLoading,
  deliveries,
  normalizeRole,
  deliveryStatusDrafts,
  setDeliveryStatusDrafts,
  handleDeliveryStatusUpdate,
}) => {
  return (
    <>
      <div className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
        <p className="text-sm font-semibold text-[#0f172a]">
          Create assignment
        </p>
        <div className="grid gap-2 mt-3 md:grid-cols-3">
          <input
            value={deliveryAssignForm.orderId}
            onChange={(event) =>
              setDeliveryAssignForm((prev) => ({
                ...prev,
                orderId: event.target.value,
              }))
            }
            placeholder="Order ID"
            className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
          />
          <select
            value={deliveryAssignForm.deliveryUserId}
            onChange={(event) =>
              setDeliveryAssignForm((prev) => ({
                ...prev,
                deliveryUserId: event.target.value,
              }))
            }
            className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
          >
            <option value="">Select delivery user</option>
            {deliveryUsers.map((user) => (
              <option key={resolveEntityId(user)} value={resolveEntityId(user)}>
                {user.name}
              </option>
            ))}
          </select>
          <input
            value={deliveryAssignForm.notes}
            onChange={(event) =>
              setDeliveryAssignForm((prev) => ({
                ...prev,
                notes: event.target.value,
              }))
            }
            placeholder="Notes"
            className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleCreateDelivery}
          disabled={actionLoading === "create-delivery"}
          className="mt-3 rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1e40af] disabled:opacity-50"
        >
          {actionLoading === "create-delivery"
            ? "Assigning..."
            : "Assign delivery"}
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[#e5edf8]">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#f8fbff]">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Order
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Delivery User
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Status
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Assigned
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Update
              </th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => {
              const deliveryId = resolveEntityId(delivery);
              const status = normalizeRole(delivery.status);
              const isTerminal =
                DELIVERY_ALLOWED_STATUS_FOR_DELIVERY_ROLE.includes(status);

              return (
                <tr key={deliveryId} className="border-t border-[#edf2fb]">
                  <td className="px-3 py-2 text-sm text-[#334155]">
                    {delivery.orderId}
                  </td>
                  <td className="px-3 py-2 text-sm text-[#334155]">
                    {delivery.deliveryUserName || delivery.deliveryUserId}
                  </td>
                  <td className="px-3 py-2 text-sm text-[#334155]">
                    <StatusPill status={status} />
                  </td>
                  <td className="px-3 py-2 text-sm text-[#334155]">
                    {formatDate(delivery.assignedAt)}
                  </td>
                  <td className="px-3 py-2 text-sm text-[#334155]">
                    <div className="flex items-center gap-2">
                      <select
                        value={deliveryStatusDrafts[deliveryId] || ""}
                        onChange={(event) =>
                          setDeliveryStatusDrafts((prev) => ({
                            ...prev,
                            [deliveryId]: event.target.value,
                          }))
                        }
                        className="rounded-lg border border-[#d4dce9] px-2 py-1 text-xs"
                      >
                        <option value="">Set status...</option>
                        {DELIVERY_STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeliveryStatusUpdate(delivery)}
                        disabled={
                          isTerminal ||
                          actionLoading === `delivery-status:${deliveryId}`
                        }
                        className="rounded-full bg-[#1d4ed8] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DeliveryManagement;

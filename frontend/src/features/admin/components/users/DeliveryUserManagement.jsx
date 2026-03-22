import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { resolveEntityId } from "../../../../utils/helpers";
import UserProfileDrawer from "./UserProfileDrawer";

function formatDate(date) {
  return new Date(date).toLocaleString();
}

const DeliveryUserManagement = ({
  roleForms,
  handleRoleFormChange,
  handleCreateRoleUser,
  actionLoading,
  users,
}) => {
  const [selectedUserId, setSelectedUserId] = useState("");

  const selectedUser = useMemo(() => {
    if (!selectedUserId) {
      return null;
    }

    return users.find((user) => resolveEntityId(user) === selectedUserId) || null;
  }, [selectedUserId, users]);

  return (
    <>
      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            value={roleForms.DELIVERY.name}
            onChange={(event) =>
              handleRoleFormChange("DELIVERY", "name", event.target.value)
            }
            placeholder="Name"
            className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
          />
          <input
            value={roleForms.DELIVERY.contactNumber}
            onChange={(event) =>
              handleRoleFormChange(
                "DELIVERY",
                "contactNumber",
                event.target.value,
              )
            }
            placeholder="Contact number"
            className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
          />
          <input
            value={roleForms.DELIVERY.password}
            onChange={(event) =>
              handleRoleFormChange("DELIVERY", "password", event.target.value)
            }
            placeholder="Password"
            className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
          />
        </div>
        <button
          type="button"
          onClick={() => handleCreateRoleUser("DELIVERY")}
          disabled={actionLoading === "create-user:DELIVERY"}
          className="mt-3 rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1e40af] disabled:opacity-50"
        >
          {actionLoading === "create-user:DELIVERY"
            ? "Creating..."
            : "Create DELIVERY"}
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
        <div className="border-b border-line bg-slate-50/80 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Delivery Profiles
          </p>
          <p className="mt-1 text-sm text-slate-600">
            View complete delivery-user account details in a side drawer.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#f8fbff]">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                  Contact
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                  Created
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                  Profile
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const userId = resolveEntityId(user);

                return (
                  <tr key={userId} className="border-t border-[#edf2fb]">
                    <td className="px-3 py-2 text-sm text-[#334155]">{user.name}</td>
                    <td className="px-3 py-2 text-sm text-[#334155]">{user.contactNumber}</td>
                    <td className="px-3 py-2 text-sm text-[#334155]">{formatDate(user.createdAt)}</td>
                    <td className="px-3 py-2 text-sm text-[#334155]">
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(userId)}
                        className="rounded-full border border-[#d4dce9] bg-white px-3 py-1 text-xs font-semibold text-[#1e3a8a] transition hover:bg-[#eff6ff]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <UserProfileDrawer user={selectedUser} onClose={() => setSelectedUserId("")} />
    </>
  );
};

DeliveryUserManagement.propTypes = {
  roleForms: PropTypes.object.isRequired,
  handleRoleFormChange: PropTypes.func.isRequired,
  handleCreateRoleUser: PropTypes.func.isRequired,
  actionLoading: PropTypes.string.isRequired,
  users: PropTypes.array.isRequired,
};

export default DeliveryUserManagement;

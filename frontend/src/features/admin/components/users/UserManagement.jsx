import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { resolveEntityId } from "../../../../utils/helpers";
import UserProfileDrawer from "./UserProfileDrawer";

const UserManagement = ({
  lookupCustomerForm,
  setLookupCustomerForm,
  handleLookupOrCreateCustomer,
  actionLoading,
  lookupCustomerResult,
  roleForms,
  handleRoleFormChange,
  handleCreateRoleUser,
  users,
  loyaltyDrafts,
  setLoyaltyDrafts,
  handleAdjustLoyalty,
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
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0f172a]">
            Lookup or create customer
          </p>
          <div className="grid gap-2 mt-3 sm:grid-cols-2">
            <input
              value={lookupCustomerForm.contactNumber}
              onChange={(event) =>
                setLookupCustomerForm((prev) => ({
                  ...prev,
                  contactNumber: event.target.value,
                }))
              }
              placeholder="Customer contact number"
              className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
            />
            <input
              value={lookupCustomerForm.name}
              onChange={(event) =>
                setLookupCustomerForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              placeholder="Customer name (optional)"
              className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
            />
          </div>
          <button
            type="button"
            onClick={handleLookupOrCreateCustomer}
            disabled={actionLoading === "lookup-customer"}
            className="mt-3 rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1e40af] disabled:opacity-50"
          >
            {actionLoading === "lookup-customer"
              ? "Processing..."
              : "Lookup or Create"}
          </button>

          {lookupCustomerResult ? (
            <div className="mt-3 rounded-xl border border-[#d4e9d7] bg-[#effef2] p-3 text-sm text-[#14532d]">
              <p className="font-semibold">Customer result</p>
              <p>Name: {lookupCustomerResult.name}</p>
              <p>Contact: {lookupCustomerResult.contactNumber}</p>
              <p>Loyalty: {lookupCustomerResult.loyaltyPoints || 0}</p>
              <p>Card: {lookupCustomerResult.loyaltyCardNumber || "N/A"}</p>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#0f172a]">
            Create USER account manually
          </p>
          <div className="mt-3 space-y-2">
            <input
              value={roleForms.USER.name}
              onChange={(event) =>
                handleRoleFormChange("USER", "name", event.target.value)
              }
              placeholder="Name"
              className="w-full rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
            />
            <input
              value={roleForms.USER.contactNumber}
              onChange={(event) =>
                handleRoleFormChange(
                  "USER",
                  "contactNumber",
                  event.target.value,
                )
              }
              placeholder="Contact number"
              className="w-full rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
            />
            <input
              value={roleForms.USER.password}
              onChange={(event) =>
                handleRoleFormChange("USER", "password", event.target.value)
              }
              placeholder="Password (optional, defaults to contact number)"
              className="w-full rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
            />
            <button
              type="button"
              onClick={() => handleCreateRoleUser("USER")}
              disabled={actionLoading === "create-user:USER"}
              className="rounded-full bg-[#0f766e] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#115e59] disabled:opacity-50"
            >
              {actionLoading === "create-user:USER"
                ? "Creating..."
                : "Create USER"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
        <div className="border-b border-line bg-slate-50/80 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Customer Profiles
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Manage loyalty and inspect complete customer details.
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
                  Loyalty
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                  Card
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                  Adjust loyalty
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                  Profile
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const id = resolveEntityId(user);
                const draft = loyaltyDrafts[id] || {
                  operation: "ADD",
                  points: "1",
                  reason: "",
                };

                return (
                  <tr key={id} className="border-t border-[#edf2fb]">
                    <td className="px-3 py-2 text-sm text-[#334155]">{user.name}</td>
                    <td className="px-3 py-2 text-sm text-[#334155]">{user.contactNumber}</td>
                    <td className="px-3 py-2 text-sm text-[#334155]">{user.loyaltyPoints || 0}</td>
                    <td className="px-3 py-2 text-sm text-[#334155]">{user.loyaltyCardNumber || "N/A"}</td>
                    <td className="px-3 py-2 text-sm text-[#334155]">
                      <div className="grid gap-2 md:grid-cols-[120px_90px_minmax(160px,1fr)_auto]">
                        <select
                          value={draft.operation}
                          onChange={(event) =>
                            setLoyaltyDrafts((prev) => ({
                              ...prev,
                              [id]: {
                                ...draft,
                                operation: event.target.value,
                              },
                            }))
                          }
                          className="rounded-lg border border-[#d4dce9] px-2 py-1 text-xs outline-none focus:border-[#1d4ed8]"
                        >
                          <option value="ADD">ADD</option>
                          <option value="DEDUCT">DEDUCT</option>
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={draft.points}
                          onChange={(event) =>
                            setLoyaltyDrafts((prev) => ({
                              ...prev,
                              [id]: {
                                ...draft,
                                points: event.target.value,
                              },
                            }))
                          }
                          className="rounded-lg border border-[#d4dce9] px-2 py-1 text-xs outline-none focus:border-[#1d4ed8]"
                        />
                        <input
                          value={draft.reason}
                          onChange={(event) =>
                            setLoyaltyDrafts((prev) => ({
                              ...prev,
                              [id]: {
                                ...draft,
                                reason: event.target.value,
                              },
                            }))
                          }
                          placeholder="Reason"
                          className="rounded-lg border border-[#d4dce9] px-2 py-1 text-xs outline-none focus:border-[#1d4ed8]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAdjustLoyalty(user)}
                          disabled={actionLoading === `loyalty:${id}`}
                          className="rounded-full bg-[#1d4ed8] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#1e40af] disabled:opacity-50"
                        >
                          Update
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-[#334155]">
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(id)}
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

UserManagement.propTypes = {
  lookupCustomerForm: PropTypes.shape({
    contactNumber: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
  setLookupCustomerForm: PropTypes.func.isRequired,
  handleLookupOrCreateCustomer: PropTypes.func.isRequired,
  actionLoading: PropTypes.string.isRequired,
  lookupCustomerResult: PropTypes.shape({
    name: PropTypes.string,
    contactNumber: PropTypes.string,
    loyaltyPoints: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    loyaltyCardNumber: PropTypes.string,
  }),
  roleForms: PropTypes.shape({
    USER: PropTypes.shape({
      name: PropTypes.string,
      contactNumber: PropTypes.string,
      password: PropTypes.string,
    }).isRequired,
  }).isRequired,
  handleRoleFormChange: PropTypes.func.isRequired,
  handleCreateRoleUser: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  loyaltyDrafts: PropTypes.object.isRequired,
  setLoyaltyDrafts: PropTypes.func.isRequired,
  handleAdjustLoyalty: PropTypes.func.isRequired,
};

UserManagement.defaultProps = {
  lookupCustomerResult: null,
};

export default UserManagement;

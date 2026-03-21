import React from "react";
import PropTypes from "prop-types";
import { resolveEntityId } from "../../../../utils/helpers";

function formatDate(date) {
  return new Date(date).toLocaleString();
}

const AdminUserManagement = ({
  roleForms,
  handleRoleFormChange,
  handleCreateRoleUser,
  actionLoading,
  users,
}) => {
  return (
    <>
      <div className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            value={roleForms.ADMIN.name}
            onChange={(event) =>
              handleRoleFormChange("ADMIN", "name", event.target.value)
            }
            placeholder="Name"
            className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
          />
          <input
            value={roleForms.ADMIN.contactNumber}
            onChange={(event) =>
              handleRoleFormChange("ADMIN", "contactNumber", event.target.value)
            }
            placeholder="Contact number"
            className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
          />
          <input
            value={roleForms.ADMIN.password}
            onChange={(event) =>
              handleRoleFormChange("ADMIN", "password", event.target.value)
            }
            placeholder="Password"
            className="rounded-xl border border-[#d4dce9] px-3 py-2 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]"
          />
        </div>
        <button
          type="button"
          onClick={() => handleCreateRoleUser("ADMIN")}
          disabled={actionLoading === "create-user:ADMIN"}
          className="mt-3 rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1e40af] disabled:opacity-50"
        >
          {actionLoading === "create-user:ADMIN"
            ? "Creating..."
            : "Create ADMIN"}
        </button>
      </div>

      <div className="grid gap-3 mt-4 md:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => (
          <article
            key={resolveEntityId(user)}
            className="rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-4"
          >
            <p className="text-sm font-semibold text-[#0f172a]">{user.name}</p>
            <p className="mt-1 text-sm text-[#64748b]">{user.contactNumber}</p>
            <p className="mt-2 text-xs text-[#64748b]">
              Created: {formatDate(user.createdAt)}
            </p>
          </article>
        ))}
      </div>
    </>
  );
};

AdminUserManagement.propTypes = {
  roleForms: PropTypes.object.isRequired,
  handleRoleFormChange: PropTypes.func.isRequired,
  handleCreateRoleUser: PropTypes.func.isRequired,
  actionLoading: PropTypes.string.isRequired,
  users: PropTypes.array.isRequired,
};

export default AdminUserManagement;

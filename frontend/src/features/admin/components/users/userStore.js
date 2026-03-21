import { useState } from "react";
import { AuthService } from "../../../../services/auth.service";
import { resolveEntityId } from "../../../../utils/helpers";

const INITIAL_ROLE_FORM = {
  USER: { name: "", contactNumber: "", password: "" },
  ADMIN: { name: "", contactNumber: "", password: "" },
  DELIVERY: { name: "", contactNumber: "", password: "" },
};

export function useUserStore({ runAction, setError, loadUsers }) {
  const [roleForms, setRoleForms] = useState(INITIAL_ROLE_FORM);
  const [lookupCustomerForm, setLookupCustomerForm] = useState({
    contactNumber: "",
    name: "",
  });
  const [lookupCustomerResult, setLookupCustomerResult] = useState(null);
  const [loyaltyDrafts, setLoyaltyDrafts] = useState({});

  const handleRoleFormChange = (role, field, value) => {
    setRoleForms((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value,
      },
    }));
  };

  const handleCreateRoleUser = async (role) => {
    const form = roleForms[role];

    if (!form.name.trim() || !form.contactNumber.trim()) {
      setError("Name and contact number are required.");
      return;
    }

    await runAction(
      `create-user:${role}`,
      async () => {
        await AuthService.createManagedUser({
          name: form.name.trim(),
          contactNumber: form.contactNumber.trim(),
          password: form.password.trim() || form.contactNumber.trim(),
          role,
        });

        setRoleForms((prev) => ({
          ...prev,
          [role]: { name: "", contactNumber: "", password: "" },
        }));

        await loadUsers();
      },
      `${role} account created successfully.`,
    );
  };

  const handleLookupOrCreateCustomer = async () => {
    if (!lookupCustomerForm.contactNumber.trim()) {
      setError("Customer contact number is required.");
      return;
    }

    await runAction(
      "lookup-customer",
      async () => {
        const response = await AuthService.lookupOrCreateCustomer({
          contactNumber: lookupCustomerForm.contactNumber.trim(),
          name: lookupCustomerForm.name.trim() || undefined,
        });

        setLookupCustomerResult(response?.user || response);
        await loadUsers();
      },
      "Customer lookup/create completed.",
    );
  };

  const handleAdjustLoyalty = async (user) => {
    const userId = resolveEntityId(user);
    const draft = loyaltyDrafts[userId] || {
      operation: "ADD",
      points: "1",
      reason: "",
    };

    await runAction(
      `loyalty:${userId}`,
      async () => {
        await AuthService.adjustUserLoyalty(userId, {
          operation: draft.operation,
          points: Number(draft.points || 0),
          reason: draft.reason || undefined,
        });

        await loadUsers();
      },
      "Loyalty points updated.",
    );
  };

  return {
    roleForms,
    lookupCustomerForm,
    setLookupCustomerForm,
    lookupCustomerResult,
    loyaltyDrafts,
    setLoyaltyDrafts,
    handleRoleFormChange,
    handleCreateRoleUser,
    handleLookupOrCreateCustomer,
    handleAdjustLoyalty,
  };
}

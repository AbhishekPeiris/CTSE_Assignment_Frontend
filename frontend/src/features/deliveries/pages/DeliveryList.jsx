import { useCallback, useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Loader from "../../../components/ui/Loader";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import StatusPill from "../../../components/ui/StatusPill";
import { useAppContext } from "../../../app/providers/AppProvider";
import { DeliveryService } from "../../../services/delivery.service";
import { DELIVERY_STATUS_OPTIONS } from "../../../utils/constants";
import {
  asCollection,
  asEntity,
  parseJsonInput,
  resolveEntityId,
  resolveRole,
  toPrettyJSON,
} from "../../../utils/helpers";

export default function DeliveryList() {
  const { auth } = useAppContext();
  const role = resolveRole(auth?.user);
  const canListDeliveries = role === "ADMIN";
  const canCreateDelivery = role === "ADMIN" || role === "DELIVERY";
  const canUpdateStatus = role === "ADMIN" || role === "DELIVERY";

  const [state, setState] = useState({ loading: true, error: "", items: [] });
  const [actionError, setActionError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [lookupId, setLookupId] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [createForm, setCreateForm] = useState({
    orderId: "",
    courierId: "",
    deliveryAddress: "",
    customPayload: "",
  });

  const loadDeliveries = useCallback(async () => {
    if (!canListDeliveries) {
      setState({ loading: false, error: "", items: [] });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await DeliveryService.getDeliveries();
      setState({
        loading: false,
        error: "",
        items: asCollection(response, ["deliveries"]),
      });
    } catch (error) {
      setState({
        loading: false,
        error: error?.friendlyMessage || error?.message || "Failed to load deliveries",
        items: [],
      });
    }
  }, [canListDeliveries]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const handleCreateChange = (event) => {
    setCreateForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCreateDelivery = async (event) => {
    event.preventDefault();
    setActionError("");

    setCreateLoading(true);

    try {
      const customPayload = parseJsonInput(createForm.customPayload);
      const payload =
        customPayload || {
          orderId: createForm.orderId,
          courierId: createForm.courierId,
          deliveryAddress: createForm.deliveryAddress,
        };

      await DeliveryService.createDelivery(payload);
      setCreateForm({ orderId: "", courierId: "", deliveryAddress: "", customPayload: "" });
      await loadDeliveries();
    } catch (error) {
      setActionError(error?.friendlyMessage || error?.message || "Failed to create delivery");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLookupById = async (event) => {
    event.preventDefault();
    setActionError("");

    if (!lookupId.trim()) {
      setActionError("Delivery ID is required.");
      return;
    }

    setLookupLoading(true);

    try {
      const response = await DeliveryService.getDeliveryById(lookupId.trim());
      setSelectedDelivery(asEntity(response, ["delivery"]));
    } catch (error) {
      setSelectedDelivery(null);
      setActionError(error?.friendlyMessage || error?.message || "Failed to fetch delivery by id");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleUpdateStatus = async (deliveryId, fallbackStatus) => {
    setActionError("");

    try {
      const status = statusDrafts[deliveryId] || fallbackStatus;
      await DeliveryService.updateDeliveryStatus(deliveryId, status);
      await loadDeliveries();

      if (selectedDelivery && resolveEntityId(selectedDelivery) === deliveryId) {
        const refreshed = await DeliveryService.getDeliveryById(deliveryId);
        setSelectedDelivery(asEntity(refreshed, ["delivery"]));
      }
    } catch (error) {
      setActionError(
        error?.friendlyMessage || error?.message || "Failed to update delivery status",
      );
    }
  };

  return (
    <Card title="Deliveries" subtitle="GET / POST / PATCH operations against delivery service">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-[#5f6368]">Manage delivery workflow and shipment statuses</p>
        {canListDeliveries ? (
          <Button variant="secondary" onClick={loadDeliveries}>
            Refresh
          </Button>
        ) : null}
      </div>

      <div className="space-y-3">
        <ErrorMessage message={state.error} />
        <ErrorMessage message={actionError} />
      </div>

      {canCreateDelivery ? (
        <form
          onSubmit={handleCreateDelivery}
          className="mb-5 mt-5 grid gap-3 rounded-xl border border-[#edf0f7] p-4 md:grid-cols-2"
        >
          <Input
            label="Order ID"
            name="orderId"
            value={createForm.orderId}
            onChange={handleCreateChange}
            required
          />

          <Input
            label="Courier ID"
            name="courierId"
            value={createForm.courierId}
            onChange={handleCreateChange}
          />

          <Input
            className="md:col-span-2"
            label="Delivery Address"
            name="deliveryAddress"
            value={createForm.deliveryAddress}
            onChange={handleCreateChange}
            required
          />

          <div className="md:col-span-2">
            <label htmlFor="delivery-custom-payload" className="mb-1 block text-sm font-medium text-[#374151]">
              Custom JSON Payload (optional)
            </label>
            <textarea
              id="delivery-custom-payload"
              name="customPayload"
              rows={4}
              value={createForm.customPayload}
              onChange={handleCreateChange}
              placeholder='{"orderId":"..."}'
              className="w-full rounded-xl border border-[#d9dde8] bg-white px-3 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc]"
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={createLoading}>
              {createLoading ? "Creating..." : "Create Delivery"}
            </Button>
          </div>
        </form>
      ) : null}

      <form
        onSubmit={handleLookupById}
        className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-[#edf0f7] p-4"
      >
        <Input
          className="min-w-[240px] flex-1"
          label="Get Delivery By ID"
          value={lookupId}
          onChange={(event) => setLookupId(event.target.value)}
          placeholder="Enter delivery id"
        />

        <Button type="submit" variant="secondary" disabled={lookupLoading}>
          {lookupLoading ? "Loading..." : "Fetch"}
        </Button>
      </form>

      {selectedDelivery ? (
        <div className="mb-5 rounded-xl border border-[#edf0f7] bg-[#fafcff] p-4">
          <p className="text-sm font-semibold text-[#1f2937]">Selected Delivery</p>
          <pre className="mt-2 overflow-x-auto text-xs text-[#334155]">{toPrettyJSON(selectedDelivery)}</pre>

          {canUpdateStatus ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {(() => {
                const selectedId = resolveEntityId(selectedDelivery);
                const currentStatus = String(selectedDelivery?.status || "PENDING").toUpperCase();

                return (
                  <>
                    <select
                      value={statusDrafts[selectedId] || currentStatus}
                      onChange={(event) =>
                        setStatusDrafts((prev) => ({ ...prev, [selectedId]: event.target.value }))
                      }
                      className="rounded-lg border border-[#d9dde8] bg-white px-2.5 py-1.5 text-xs text-[#1f2937] outline-none focus:border-[#1a73e8]"
                    >
                      {DELIVERY_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <Button size="sm" onClick={() => handleUpdateStatus(selectedId, currentStatus)}>
                      Update Status
                    </Button>
                  </>
                );
              })()}
            </div>
          ) : null}
        </div>
      ) : null}

      {state.loading ? <Loader text="Loading deliveries..." /> : null}

      {!state.loading && !canListDeliveries ? (
        <p className="text-sm text-[#6b7280]">
          Full delivery listing requires ADMIN role. You can still fetch a specific delivery by id.
        </p>
      ) : null}

      {!state.loading && canListDeliveries && state.items.length === 0 ? (
        <p className="text-sm text-[#6b7280]">No deliveries found.</p>
      ) : null}

      {!state.loading && canListDeliveries && state.items.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-[#edf0f7]">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#f8fafd]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Courier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.items.map((delivery, index) => {
                const deliveryId = resolveEntityId(delivery);
                const currentStatus = String(delivery?.status || "PENDING").toUpperCase();

                return (
                  <tr key={deliveryId || `delivery-${index}`} className="border-t border-[#edf0f7]">
                    <td className="px-4 py-3 text-sm text-[#374151]">{deliveryId || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-[#374151]">{delivery?.orderId || delivery?.order?._id || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {delivery?.courier || delivery?.courierId || delivery?.deliveryPerson || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      <StatusPill status={currentStatus} />
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {canUpdateStatus ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={statusDrafts[deliveryId] || currentStatus}
                            onChange={(event) =>
                              setStatusDrafts((prev) => ({ ...prev, [deliveryId]: event.target.value }))
                            }
                            className="rounded-lg border border-[#d9dde8] bg-white px-2.5 py-1.5 text-xs text-[#1f2937] outline-none focus:border-[#1a73e8]"
                          >
                            {DELIVERY_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(deliveryId, currentStatus)}
                          >
                            Update
                          </Button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Loader from "../../../components/ui/Loader";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import StatusPill from "../../../components/ui/StatusPill";
import { useAppContext } from "../../../app/providers/AppProvider";
import { ProductService } from "../../../services/product.service";
import { OrderService } from "../../../services/order.service";
import { DeliveryService } from "../../../services/delivery.service";
import { UserService } from "../../../services/user.service";
import {
  asCollection,
  asEntity,
  formatMoney,
  normalizeStatus,
  resolveEntityId,
  resolveRole,
  toPrettyJSON,
} from "../../../utils/helpers";

function MetricCard({ label, value, helper }) {
  return (
    <article className="rounded-xl border border-[#e7ebf3] bg-[#fafcff] p-4">
      <p className="text-sm text-[#5f6368]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#1f2937]">{value}</p>
      <p className="mt-1 text-xs text-[#6b7280]">{helper}</p>
    </article>
  );
}

export default function Dashboard() {
  const { auth } = useAppContext();
  const role = resolveRole(auth?.user);

  const [state, setState] = useState({
    loading: true,
    error: "",
    products: [],
    orders: [],
    deliveries: [],
  });

  const [myOrders, setMyOrders] = useState({
    loading: false,
    error: "",
    items: [],
  });

  const [profileLookupId, setProfileLookupId] = useState("");
  const [profileLookup, setProfileLookup] = useState({
    loading: false,
    error: "",
    data: null,
  });

  const loadDashboard = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    const productsReq = ProductService.getAllProducts();
    let ordersReq = Promise.resolve([]);

    if (role === "ADMIN") {
      ordersReq = OrderService.getAllOrders();
    } else if (role) {
      ordersReq = UserService.getMyOrders();
    }

    const deliveriesReq =
      role === "ADMIN" ? DeliveryService.getDeliveries() : Promise.resolve([]);

    const [productsResult, ordersResult, deliveriesResult] = await Promise.allSettled([
      productsReq,
      ordersReq,
      deliveriesReq,
    ]);

    const products =
      productsResult.status === "fulfilled"
        ? asCollection(productsResult.value, ["products"])
        : [];

    const orders =
      ordersResult.status === "fulfilled"
        ? asCollection(ordersResult.value, ["orders"])
        : [];

    const deliveries =
      deliveriesResult.status === "fulfilled"
        ? asCollection(deliveriesResult.value, ["deliveries"])
        : [];

    const failed = [productsResult, ordersResult, deliveriesResult].some(
      (result) => result.status === "rejected",
    );

    setState({
      loading: false,
      error: failed ? "Some dashboard modules could not be loaded." : "",
      products,
      orders,
      deliveries,
    });
  }, [role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  }, [loadDashboard]);

  const revenue = useMemo(() => {
    return state.orders.reduce((sum, order) => {
      const amount =
        Number(order?.totalAmount) || Number(order?.amount) || Number(order?.total) || 0;
      return sum + amount;
    }, 0);
  }, [state.orders]);

  const inTransit = useMemo(() => {
    return state.deliveries.filter((delivery) => {
      const status = normalizeStatus(delivery?.status).toUpperCase();
      return status.includes("ROUTE") || status.includes("DISPATCH") || status === "ASSIGNED";
    }).length;
  }, [state.deliveries]);

  const handleLoadMyOrders = async () => {
    setMyOrders({ loading: true, error: "", items: [] });

    try {
      const response = await UserService.getMyOrders();
      setMyOrders({
        loading: false,
        error: "",
        items: asCollection(response, ["orders"]),
      });
    } catch (error) {
      setMyOrders({
        loading: false,
        error: error?.friendlyMessage || error?.message || "Failed to load my orders",
        items: [],
      });
    }
  };

  const handleLookupPublicProfile = async (event) => {
    event.preventDefault();

    if (!profileLookupId.trim()) {
      setProfileLookup({
        loading: false,
        error: "Please provide a user id.",
        data: null,
      });
      return;
    }

    setProfileLookup({ loading: true, error: "", data: null });

    try {
      const response = await UserService.getPublicProfile(profileLookupId.trim());
      setProfileLookup({
        loading: false,
        error: "",
        data: asEntity(response, ["user", "profile"]),
      });
    } catch (error) {
      setProfileLookup({
        loading: false,
        error: error?.friendlyMessage || error?.message || "Unable to fetch public profile",
        data: null,
      });
    }
  };

  if (state.loading) {
    return <Loader text="Loading dashboard analytics..." />;
  }

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5f6368]">
              Overview
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#1f2937]">
              Welcome{auth?.user?.name ? `, ${auth.user.name}` : ""}
            </h2>
            <p className="mt-2 text-sm text-[#5f6368]">
              Live backend mode with hosted API gateway integrations.
            </p>
          </div>

          <Button variant="secondary" onClick={loadDashboard}>
            Refresh
          </Button>
        </div>

        <div className="mt-5">
          <ErrorMessage message={state.error} />
        </div>

        <div className="grid gap-4 mt-6 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Role" value={role || "Guest"} helper="Current access profile" />
          <MetricCard label="Products" value={String(state.products.length)} helper="Catalog count" />
          <MetricCard label="Orders" value={String(state.orders.length)} helper="Loaded order records" />
          <MetricCard
            label="Deliveries"
            value={String(state.deliveries.length)}
            helper={role === "ADMIN" ? `${inTransit} in transit` : "Admin scope required"}
          />
          <MetricCard
            label="Revenue"
            value={formatMoney(revenue)}
            helper="Calculated from order totals"
          />
        </div>
      </Card>

      <div className="grid gap-2 xl:grid-cols-2">
        <Card title="My Orders (Auth Route)">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[#5f6368]">Fetch orders from /auth/me/orders</p>
            <Button variant="secondary" size="sm" onClick={handleLoadMyOrders}>
              Load
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {myOrders.loading ? <p className="text-sm text-[#5f6368]">Loading...</p> : null}
            <ErrorMessage message={myOrders.error} />

            {!myOrders.loading && !myOrders.error && myOrders.items.length === 0 ? (
              <p className="text-sm text-[#5f6368]">No records loaded yet.</p>
            ) : null}

            {myOrders.items.slice(0, 4).map((order, index) => {
              const orderId = resolveEntityId(order);

              return (
                <div
                  key={orderId || `my-order-${index}`}
                  className="rounded-xl border border-[#edf0f7] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-[#1f2937]">{orderId || "Order"}</p>
                    <StatusPill status={order?.status} />
                  </div>
                  <p className="mt-2 text-sm text-[#5f6368]">
                    Total: {formatMoney(order?.totalAmount || order?.amount || order?.total)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Public Profile Lookup" subtitle="Fetch profile via /auth/:id/public">
          <form onSubmit={handleLookupPublicProfile} className="space-y-3">
            <Input
              label="User ID"
              value={profileLookupId}
              onChange={(event) => setProfileLookupId(event.target.value)}
              placeholder="Enter user id"
            />

            <Button type="submit" disabled={profileLookup.loading}>
              {profileLookup.loading ? "Loading..." : "Lookup"}
            </Button>
          </form>

          <div className="mt-4">
            <ErrorMessage message={profileLookup.error} />
          </div>

          {profileLookup.data ? (
            <pre className="mt-4 overflow-x-auto rounded-xl border border-[#edf0f7] bg-[#fafcff] p-3 text-xs text-[#334155]">
              {toPrettyJSON(profileLookup.data)}
            </pre>
          ) : null}
        </Card>
      </div>
    </>
  );
}

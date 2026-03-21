import { Link, useSearchParams } from "react-router-dom";
import { LOGO } from "../../../assets";

const CUSTOMER_TABS = new Set(["customers", "admins", "deliveryUsers"]);

export default function AdminSideBar() {
  const [searchParams] = useSearchParams();
  const selectedTab = searchParams.get("tab") || "dashboard";
  const selectedOrderView = searchParams.get("orderView") || "make";

  const isCustomersGroupActive = CUSTOMER_TABS.has(selectedTab);
  const isOrdersGroupActive = selectedTab === "orders";

  return (
    <aside className="h-full text-white bg-white border-r border-line">
      <div className="flex flex-col h-full">
        <div className="px-5 py-5 border-b border-line">
          <p className="text-xs uppercase tracking-[0.18em] text-[#93c5fd]">
            Workspace
          </p>
          <img
            src={LOGO}
            alt="Anjana Grocery"
            className="object-contain w-auto h-10"
          />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          <Link
            to="/admin-portal?tab=dashboard"
            className={[
              "block rounded-xl px-3 py-2 text-sm font-medium transition",
              selectedTab === "dashboard"
                ? "bg-[#1d4ed8]/10 text-primary"
                : "text-label hover:bg-line/30",
            ].join(" ")}
          >
            Dashboard
          </Link>

          <div className="p-2 rounded-xl">
            <Link
              to="/admin-portal?tab=customers"
              className={[
                "block rounded-lg px-3 py-2 text-sm font-semibold transition",
                isCustomersGroupActive
                  ? "bg-[#1d4ed8]/10 text-primary"
                  : "text-label hover:bg-line/30",
              ].join(" ")}
            >
              Users
            </Link>

            <div className="pl-2 mt-2 space-y-1 border-l border-line">
              {[
                { key: "customers", label: "Customers" },
                { key: "admins", label: "Admin Users" },
                { key: "deliveryUsers", label: "Delivery Users" },
              ].map((item) => (
                <Link
                  key={item.key}
                  to={`/admin-portal?tab=${item.key}`}
                  className={[
                    "block rounded-md px-3 py-1.5 text-xs font-medium transition",
                    selectedTab === item.key
                      ? "bg-[#1d4ed8]/10 text-primary"
                      : "text-label hover:bg-line/30",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/admin-portal?tab=products"
            className={[
              "block rounded-xl px-3 py-2 text-sm font-medium transition",
              selectedTab === "products"
                ? "bg-[#1d4ed8]/10 text-primary"
                : "text-label hover:bg-line/30",
            ].join(" ")}
          >
            Products
          </Link>

          <div className="p-2 rounded-xl">
            <Link
              to="/admin-portal?tab=orders&orderView=make"
              className={[
                "block rounded-lg px-3 py-2 text-sm font-semibold transition",
                isOrdersGroupActive
                  ? "bg-[#1d4ed8]/10 text-primary"
                  : "text-label hover:bg-line/30",
              ].join(" ")}
            >
              Orders
            </Link>

            <div className="pl-2 mt-2 space-y-1 border-l border-line">
              {[
                { key: "make", label: "Make Order" },
                { key: "history", label: "Order History" },
              ].map((item) => (
                <Link
                  key={item.key}
                  to={`/admin-portal?tab=orders&orderView=${item.key}`}
                  className={[
                    "block rounded-md px-3 py-1.5 text-xs font-medium transition",
                    isOrdersGroupActive && selectedOrderView === item.key
                      ? "bg-[#1d4ed8]/10 text-primary"
                      : "text-label hover:bg-line/30",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/admin-portal?tab=deliveries"
            className={[
              "block rounded-xl px-3 py-2 text-sm font-medium transition",
              selectedTab === "deliveries"
                ? "bg-[#1d4ed8]/10 text-primary"
                : "text-label hover:bg-line/30",
            ].join(" ")}
          >
            Deliveries
          </Link>
        </nav>
      </div>
    </aside>
  );
}

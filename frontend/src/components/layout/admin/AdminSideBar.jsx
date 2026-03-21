import { Link, useSearchParams } from "react-router-dom";
import { LOGO } from "../../../assets";

const ADMIN_MENU_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "customers", label: "Customers" },
  { key: "admins", label: "Admin Users" },
  { key: "deliveryUsers", label: "Delivery Users" },
  { key: "products", label: "Products" },
  { key: "orders", label: "Orders" },
  { key: "deliveries", label: "Deliveries" },
];

export default function AdminSideBar() {
  const [searchParams] = useSearchParams();
  const selectedTab = searchParams.get("tab") || "dashboard";

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
          {ADMIN_MENU_ITEMS.map((item) => (
            <Link
              key={item.key}
              to={`/admin-portal?tab=${item.key}`}
              className={[
                "block rounded-xl px-3 py-2 text-sm font-medium transition",
                selectedTab === item.key
                  ? "bg-[#1d4ed8]/10 text-primary"
                  : "text-label hover:bg-line/30",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

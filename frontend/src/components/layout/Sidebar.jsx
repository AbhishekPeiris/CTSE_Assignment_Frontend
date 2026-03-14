import { NavLink, useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard" },
  { path: "/products", label: "Products" },
  {
    path: "/orders/sales",
    label: "Orders",
    sectionMatch: "/orders",
    children: [
      { path: "/orders/sales", label: "Sales Catalog" },
      { path: "/orders/history", label: "Order History" },
    ],
  },
  { path: "/deliveries", label: "Deliveries" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isOrdersSectionActive = location.pathname.startsWith("/orders");

  return (
    <aside className="rounded-2xl border border-[#e7ebf3] bg-white p-4 shadow-sm">
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
          const isSectionActive = item.sectionMatch
            ? location.pathname.startsWith(item.sectionMatch)
            : item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          if (!hasChildren) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  [
                    "block rounded-xl px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[#e8f0fe] text-[#1a73e8]"
                      : "text-[#3c4043] hover:bg-[#f6f8fc]",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            );
          }

          return (
            <div key={item.label} className="space-y-1">
              <button
                type="button"
                onClick={() => navigate(item.path)}
                className={[
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
                  isSectionActive
                    ? "bg-[#e8f0fe] text-[#1a73e8]"
                    : "text-[#3c4043] hover:bg-[#f6f8fc]",
                ].join(" ")}
              >
                <span>{item.label}</span>
                <span
                  className={[
                    "text-xs transition-transform duration-200",
                    isOrdersSectionActive ? "rotate-90 scale-110" : "scale-100",
                  ].join(" ")}
                >
                  {">"}
                </span>
              </button>

              <div
                className={[
                  "grid overflow-hidden pl-3 transition-all duration-200",
                  isOrdersSectionActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                ].join(" ")}
              >
                <div className="min-h-0">
                  <div className="space-y-1 border-l border-[#d7e3fd] pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          [
                            "block rounded-xl px-3 py-2 text-sm transition",
                            isActive
                              ? "bg-[#eef4ff] font-semibold text-[#1a73e8]"
                              : "text-[#5f6368] hover:bg-[#f6f8fc]",
                          ].join(" ")
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

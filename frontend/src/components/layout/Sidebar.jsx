import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard" },
  { path: "/products", label: "Products" },
  { path: "/orders", label: "Orders" },
  { path: "/deliveries", label: "Deliveries" },
];

export default function Sidebar() {
  return (
    <aside className="rounded-2xl border border-[#e7ebf3] bg-white p-4 shadow-sm">
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => (
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
        ))}
      </nav>
    </aside>
  );
}

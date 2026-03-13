import { NavLink, useNavigate } from "react-router-dom";
import { useAppContext } from "../../app/providers/AppProvider";

export default function Navbar({ health }) {
  const { auth, logout } = useAppContext();
  const navigate = useNavigate();

  const userLabel = auth?.user?.name || auth?.user?.email || "User";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#e7ebf3] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1260px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[#1f2937]">
            CTSE Ops Dashboard
          </h1>
          <p className="text-xs text-[#5f6368]">Live API Connected</p>
        </div>

        <div className="hidden w-full max-w-md sm:block">
          <div className="rounded-full border border-[#e5e7eb] bg-[#f8fafd] px-4 py-2 text-sm text-[#6b7280]">
            API Gateway: 104.43.50.123
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full bg-[#eef3fd] px-3 py-1 text-xs font-semibold ${health?.toneClass || "text-slate-500"}`}
          >
            {health?.label || "Checking API"}
          </span>

          {auth?.isAuthenticated ? (
            <>
              <span className="hidden rounded-full border border-[#e5e7eb] px-3 py-1 text-sm text-[#3c4043] md:block">
                {userLabel}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-[#d9dde8] bg-white px-4 py-2 text-sm font-medium text-[#3c4043] transition hover:bg-[#f6f8fc]"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="rounded-full border border-[#d9dde8] bg-white px-4 py-2 text-sm font-medium text-[#3c4043] transition hover:bg-[#f6f8fc]"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-full bg-[#1a73e8] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#155fc6]"
              >
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

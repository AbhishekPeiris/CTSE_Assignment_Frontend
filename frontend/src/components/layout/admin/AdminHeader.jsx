import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../../app/providers/AppProvider";
import { resolveRole } from "../../../utils/helpers";

export default function AdminHeader() {
  const navigate = useNavigate();
  const { auth, logout } = useAppContext();

  return (
    <header className="sticky top-0 z-20 border-b border-[#dbe5f7] bg-white/95 backdrop-blur">
      <div className="flex min-h-[72px] items-center justify-between px-5 sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">
            Admin Workspace
          </p>
          {/* <h1 className="text-xl font-semibold text-[#0f172a]">Dashboard</h1> */}
          <p className="mt-0.5 text-xs text-[#64748b]">
            Signed in as {auth?.user?.name || auth?.user?.contactNumber} (
            {resolveRole(auth?.user)})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className="rounded-full bg-[#dc2626] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#b91c1c]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

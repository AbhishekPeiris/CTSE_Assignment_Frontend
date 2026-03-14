import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useApiHealth } from "../../hooks/useApiHealth";

export default function AppShell() {
  const health = useApiHealth();

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#202124]">
      <Navbar health={health} />

      <div className="mx-auto grid w-full max-w-full gap-2 py-2 sm:px-2 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-2">
        <Sidebar />

        <div className="flex min-h-[calc(100vh-144px)] flex-col gap-5">
          <main className="flex-1 space-y-2">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

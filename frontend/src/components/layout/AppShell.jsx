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

      <div className="mx-auto grid w-full max-w-[1260px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <Sidebar />

        <div className="flex min-h-[calc(100vh-144px)] flex-col gap-5">
          <main className="flex-1 space-y-5">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

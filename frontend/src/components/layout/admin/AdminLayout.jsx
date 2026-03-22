import AdminHeader from "./AdminHeader";
import AdminSideBar from "./AdminSideBar";
import PropTypes from "prop-types";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[260px_1fr]">
        <AdminSideBar />

        <div className="flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

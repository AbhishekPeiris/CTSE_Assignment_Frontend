import React from "react";
import PropTypes from "prop-types";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LOGO } from "../../../assets";

const ClientNavBar = ({ isUser, role, isLoggedIn, auth, logout }) => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-line backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1220px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={LOGO}
            alt="Anjana Grocery"
            className="object-contain w-auto h-10"
          />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-[#334155] md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "text-[#0f172a] underline" : "hover:text-[#0f172a]"
            }
          >
            Home
          </NavLink>
          {isUser ? (
            <NavLink to="/my-orders" className="hover:text-[#0f172a]">
              My Orders
            </NavLink>
          ) : null}
          {role === "ADMIN" ? (
            <NavLink to="/admin-portal" className="hover:text-[#0f172a]">
              Admin Portal
            </NavLink>
          ) : null}
          {role === "DELIVERY" ? (
            <NavLink to="/delivery-portal" className="hover:text-[#0f172a]">
              Delivery Portal
            </NavLink>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <span className="hidden rounded-full bg-[#fff1cf] px-3 py-1 text-xs font-semibold text-[#7c2d12] sm:inline-block">
                {auth?.user?.name || auth?.user?.contactNumber || "User"} ·{" "}
                {role}
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="rounded-full border border-[#d1c3a2] bg-white px-4 py-2 text-xs font-semibold text-[#334155] transition hover:bg-[#f8f2e7]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-[#d1c3a2] bg-white px-4 py-2 text-xs font-semibold text-[#334155] transition hover:bg-[#f8f2e7]"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-[#0ea5a4] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0b8e8d]"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

ClientNavBar.propTypes = {
  isUser: PropTypes.bool.isRequired,
  role: PropTypes.string,
  isLoggedIn: PropTypes.bool.isRequired,
  auth: PropTypes.shape({
    user: PropTypes.shape({
      name: PropTypes.string,
      contactNumber: PropTypes.string,
    }),
  }),
  logout: PropTypes.func.isRequired,
};

ClientNavBar.defaultProps = {
  role: "GUEST",
  auth: null,
};

export default ClientNavBar;

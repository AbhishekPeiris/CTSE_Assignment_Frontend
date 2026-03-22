import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LOGO } from "../../../assets";
import {
  getCartCount,
  useClientStore,
} from "../../../features/client/clientStore";

const ClientNavBar = ({ isUser, role, isLoggedIn, auth, logout }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const clientState = useClientStore();
  const cartCount = useMemo(() => getCartCount(clientState), [clientState]);

  const mainLinks = [
    { to: "/", label: "Home" },
    // { to: "/cart", label: "Cart" },
    { to: "/guide", label: "Guide" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  if (isUser) {
    mainLinks.push({ to: "/my-orders", label: "My Orders" });
    mainLinks.push({ to: "/profile", label: "Profile" });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#dfe5eb] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1220px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={LOGO}
            alt="Anjana Grocery"
            className="object-contain w-auto h-10"
          />
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-[#3c4043] md:flex">
          {mainLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                isActive ? "text-[#1a73e8]" : "hover:text-[#202124]"
              }
            >
              {link.label}
            </NavLink>
          ))}
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
          <Link
            to="/cart"
            className="relative rounded-full border border-[#d3dce6] bg-white px-3 py-2 text-xs font-semibold text-[#3c4043]"
          >
            Cart
            <span className="ml-2 rounded-full bg-[#1a73e8] px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {cartCount}
            </span>
          </Link>

          {isLoggedIn ? (
            <>
              <span className="hidden rounded-full bg-[#e8f0fe] px-3 py-1 text-xs font-semibold text-[#174ea6] sm:inline-block">
                {auth?.user?.name || auth?.user?.contactNumber || "User"} ·{" "}
                {role}
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                  navigate("/");
                }}
                className="rounded-full border border-[#d3dce6] bg-white px-4 py-2 text-xs font-semibold text-[#334155] transition hover:bg-[#f6fafe]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-[#d3dce6] bg-white px-4 py-2 text-xs font-semibold text-[#334155] transition hover:bg-[#f6fafe]"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-[#1a73e8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1557b0]"
              >
                Register
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-full border border-[#d3dce6] px-3 py-2 text-xs font-semibold text-[#334155] md:hidden"
          >
            Menu
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[#dfe5eb] bg-white px-4 py-3 md:hidden"
          >
            <div className="grid gap-2 text-sm font-medium text-[#3c4043]">
              {mainLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 ${isActive ? "bg-[#e8f0fe] text-[#174ea6]" : ""}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/privacy-policy"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-xl"
              >
                Privacy Policy
              </NavLink>
              <NavLink
                to="/terms-and-conditions"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-xl"
              >
                Terms & Conditions
              </NavLink>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
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

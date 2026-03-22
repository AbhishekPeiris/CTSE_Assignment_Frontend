import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { formatMoney } from "../../../utils/helpers";

export default function HeroSection({ cartCount, subtotal, loyaltyBalance }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden bg-white border rounded-3xl border-line"
    >
      <div className="px-5 py-6 bg-white sm:px-6">
        <p className="text-xs uppercase tracking-[0.2em] text-word">
          Anjana Grocery
        </p>
        <h1 className="mt-2 text-2xl font-semibold leading-tight text-label sm:text-3xl">
          Fresh groceries, simpler ordering, better mobile experience.
        </h1>
        <p className="mt-2 text-sm text-word">
          Search products, add to cart, checkout quickly, and track every order.
        </p>

        <div className="grid gap-2 mt-4 sm:grid-cols-3">
          <div className="px-3 py-2 bg-white border-2 rounded-2xl gradient-border">
            <p className="text-[11px] uppercase tracking-wide text-word">
              Cart items
            </p>
            <p className="text-base font-semibold text-label">{cartCount}</p>
          </div>
          <div className="px-3 py-2 bg-white border-2 rounded-2xl gradient-border">
            <p className="text-[11px] uppercase tracking-wide text-word">
              Subtotal
            </p>
            <p className="text-base font-semibold text-label">
              {formatMoney(subtotal)}
            </p>
          </div>
          <div className="px-3 py-2 bg-white border-2 rounded-2xl gradient-border">
            <p className="text-[11px] uppercase tracking-wide text-word">
              Loyalty
            </p>
            <p className="text-base font-semibold text-label">
              {loyaltyBalance} pts
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

HeroSection.propTypes = {
  cartCount: PropTypes.number.isRequired,
  subtotal: PropTypes.number.isRequired,
  loyaltyBalance: PropTypes.number.isRequired,
};

import React from "react";
import PropTypes from "prop-types";

const CARD_CONFIG = [
    { label: "Customers", key: "customers" },
    { label: "Admins", key: "admins" },
    { label: "Delivery Users", key: "deliveryUsers" },
    { label: "Products", key: "products" },
    { label: "Orders", key: "orders" },
    { label: "Pending Orders", key: "pendingOrders" },
    { label: "Deliveries", key: "deliveries" },
    { label: "In Progress Deliveries", key: "inProgressDeliveries" },
];

const OverviewDashboard = ({ metrics }) => {
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CARD_CONFIG.map((card) => (
                <div
                    key={card.key}
                    className="rounded-xl border border-[#e4ecfb] bg-[#f8fbff] p-4"
                >
                    <p className="text-xs uppercase tracking-wide text-[#64748b]">
                        {card.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[#0f172a]">
                        {metrics[card.key] ?? 0}
                    </p>
                </div>
            ))}
        </div>
    );
};

OverviewDashboard.propTypes = {
    metrics: PropTypes.object.isRequired,
};

export default OverviewDashboard;

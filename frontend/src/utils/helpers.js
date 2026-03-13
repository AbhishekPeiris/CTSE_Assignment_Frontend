export const formatCurrency = (amount, currency = "USD") => {
    const numeric = Number(amount || 0);

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(Number.isFinite(numeric) ? numeric : 0);
};

export const formatMoney = (amount) => formatCurrency(amount, "USD");

export const formatDate = (value) => {
    if (!value) {
        return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "N/A";
    }

    return new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date);
};

export const truncateText = (text, length = 100) => {
    if (!text) {
        return "";
    }

    return text.length > length ? `${text.substring(0, length)}...` : text;
};

export const unwrapPayload = (payload) => {
    if (
        payload &&
        typeof payload === "object" &&
        Object.hasOwn(payload, "data") &&
        payload.data !== undefined
    ) {
        return unwrapPayload(payload.data);
    }

    return payload;
};

export const asCollection = (payload, preferredKeys = []) => {
    const normalized = unwrapPayload(payload);

    if (Array.isArray(normalized)) {
        return normalized;
    }

    if (!normalized || typeof normalized !== "object") {
        return [];
    }

    const candidateKeys = [
        ...preferredKeys,
        "items",
        "results",
        "rows",
        "list",
        "products",
        "orders",
        "deliveries",
    ];

    for (const key of candidateKeys) {
        if (Array.isArray(normalized[key])) {
            return normalized[key];
        }
    }

    return [];
};

export const asEntity = (payload, preferredKeys = []) => {
    const normalized = unwrapPayload(payload);

    if (!normalized) {
        return null;
    }

    if (Array.isArray(normalized)) {
        return normalized[0] || null;
    }

    if (typeof normalized !== "object") {
        return null;
    }

    for (const key of preferredKeys) {
        if (normalized[key] && typeof normalized[key] === "object") {
            return normalized[key];
        }
    }

    return normalized;
};

export const getTokenFromAuthPayload = (payload) => {
    return (
        payload?.token ||
        payload?.accessToken ||
        payload?.data?.token ||
        payload?.data?.accessToken ||
        payload?.data?.data?.token ||
        null
    );
};

export const getUserFromAuthPayload = (payload) => {
    return payload?.user || payload?.data?.user || payload?.data?.data?.user || null;
};

export const resolveEntityId = (entity) => {
    return (
        entity?._id ||
        entity?.id ||
        entity?.userId ||
        entity?.user?._id ||
        entity?.user?.id ||
        ""
    );
};

export const resolveRole = (user) => {
    return String(user?.role || user?.data?.role || "").toUpperCase();
};

export const normalizeStatus = (status) => {
    return String(status || "UNKNOWN").replaceAll("_", " ").replaceAll(/\s+/g, " ").trim();
};

export const statusClasses = (status) => {
    const normalized = normalizeStatus(status).toUpperCase();

    const styles = {
        ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
        AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
        RESERVED: "bg-amber-50 text-amber-700 border-amber-200",
        "LOW STOCK": "bg-amber-50 text-amber-700 border-amber-200",
        "OUT OF STOCK": "bg-rose-50 text-rose-700 border-rose-200",
        PENDING: "bg-slate-100 text-slate-700 border-slate-200",
        PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
        CONFIRMED: "bg-sky-50 text-sky-700 border-sky-200",
        SHIPPED: "bg-cyan-50 text-cyan-700 border-cyan-200",
        DISPATCHED: "bg-indigo-50 text-indigo-700 border-indigo-200",
        "ON ROUTE": "bg-indigo-50 text-indigo-700 border-indigo-200",
        DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
        CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
        FAILED: "bg-rose-50 text-rose-700 border-rose-200",
    };

    return styles[normalized] || "bg-slate-50 text-slate-700 border-slate-200";
};

export const getStatusColor = (status) => {
    const normalized = normalizeStatus(status).toUpperCase();

    if (normalized === "DELIVERED") {
        return "green";
    }

    if (normalized === "PROCESSING") {
        return "orange";
    }

    if (normalized === "PENDING") {
        return "gray";
    }

    return "blue";
};

export const parseJsonInput = (value) => {
    if (!String(value || "").trim()) {
        return null;
    }

    return JSON.parse(value);
};

export const toPrettyJSON = (value) => {
    try {
        return JSON.stringify(value, null, 2);
    } catch (error) {
        console.error("Unable to stringify value", error);
        return String(value);
    }
};
import PropTypes from "prop-types";

function formatDate(dateValue) {
    if (!dateValue) {
        return "N/A";
    }

    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
        return "N/A";
    }

    return parsedDate.toLocaleString();
}

export default function UserProfileDrawer({ user, onClose }) {
    if (!user) {
        return null;
    }

    const initials = String(user?.name || "?")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45">
            <button
                type="button"
                className="h-full flex-1 cursor-default"
                aria-label="Close user profile drawer"
                onClick={onClose}
            />

            <dialog
                open
                className="relative m-0 h-full w-full max-w-xl overflow-y-auto border-l border-line bg-white shadow-2xl"
                aria-label="User profile drawer"
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/95 px-6 py-4 backdrop-blur">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            User Profile
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-900">
                            {user?.name || "Unknown User"}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        Close
                    </button>
                </div>

                <div className="p-6">
                    <div className="rounded-2xl border border-line bg-gradient-to-r from-sky-50 to-indigo-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-semibold text-white">
                                {initials || "U"}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{user?.name || "N/A"}</p>
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                    {String(user?.role || "N/A")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <dl className="mt-5 grid gap-3">
                        <div className="rounded-xl border border-line bg-slate-50 px-4 py-3">
                            <dt className="text-xs uppercase tracking-wide text-slate-500">User ID</dt>
                            <dd className="mt-1 break-all text-sm font-medium text-slate-900">{user?._id || user?.id || "N/A"}</dd>
                        </div>
                        <div className="rounded-xl border border-line bg-slate-50 px-4 py-3">
                            <dt className="text-xs uppercase tracking-wide text-slate-500">Contact Number</dt>
                            <dd className="mt-1 text-sm font-medium text-slate-900">{user?.contactNumber || "N/A"}</dd>
                        </div>
                        <div className="rounded-xl border border-line bg-slate-50 px-4 py-3">
                            <dt className="text-xs uppercase tracking-wide text-slate-500">Loyalty Points</dt>
                            <dd className="mt-1 text-sm font-medium text-slate-900">{Number(user?.loyaltyPoints || 0)}</dd>
                        </div>
                        <div className="rounded-xl border border-line bg-slate-50 px-4 py-3">
                            <dt className="text-xs uppercase tracking-wide text-slate-500">Loyalty Card</dt>
                            <dd className="mt-1 text-sm font-medium text-slate-900">{user?.loyaltyCardNumber || "N/A"}</dd>
                        </div>
                        <div className="rounded-xl border border-line bg-slate-50 px-4 py-3">
                            <dt className="text-xs uppercase tracking-wide text-slate-500">Status</dt>
                            <dd className="mt-1 text-sm font-medium text-slate-900">
                                {user?.isActive === false ? "Inactive" : "Active"}
                            </dd>
                        </div>
                        <div className="rounded-xl border border-line bg-slate-50 px-4 py-3">
                            <dt className="text-xs uppercase tracking-wide text-slate-500">Created At</dt>
                            <dd className="mt-1 text-sm font-medium text-slate-900">{formatDate(user?.createdAt)}</dd>
                        </div>
                        <div className="rounded-xl border border-line bg-slate-50 px-4 py-3">
                            <dt className="text-xs uppercase tracking-wide text-slate-500">Updated At</dt>
                            <dd className="mt-1 text-sm font-medium text-slate-900">{formatDate(user?.updatedAt)}</dd>
                        </div>
                    </dl>
                </div>
            </dialog>
        </div>
    );
}

UserProfileDrawer.propTypes = {
    user: PropTypes.object,
    onClose: PropTypes.func.isRequired,
};

UserProfileDrawer.defaultProps = {
    user: null,
};

import { Link } from "react-router-dom";
import { useAppContext } from "../../../app/providers/AppProvider";
import { resolveRole } from "../../../utils/helpers";

export default function ProfilePage() {
    const { auth } = useAppContext();
    const user = auth?.user;

    if (!auth?.isAuthenticated) {
        return (
            <div className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-[#d9e2ec] bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-[#202124]">Profile</h1>
                    <p className="mt-2 text-sm text-[#5f6368]">
                        Please <Link to="/login" className="font-semibold text-[#1967d2]">login</Link> to view your profile details.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-[#d9e2ec] bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold text-[#202124]">Profile</h1>
                <p className="mt-1 text-sm text-[#5f6368]">Manage your account information and loyalty details.</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#e3e8ef] bg-[#f8fafd] p-3">
                        <p className="text-xs uppercase tracking-wide text-[#5f6368]">Name</p>
                        <p className="mt-1 text-sm font-semibold text-[#202124]">{user?.name || "N/A"}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e3e8ef] bg-[#f8fafd] p-3">
                        <p className="text-xs uppercase tracking-wide text-[#5f6368]">Role</p>
                        <p className="mt-1 text-sm font-semibold text-[#202124]">{resolveRole(user)}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e3e8ef] bg-[#f8fafd] p-3">
                        <p className="text-xs uppercase tracking-wide text-[#5f6368]">Contact</p>
                        <p className="mt-1 text-sm font-semibold text-[#202124]">{user?.contactNumber || "N/A"}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e3e8ef] bg-[#f8fafd] p-3">
                        <p className="text-xs uppercase tracking-wide text-[#5f6368]">Loyalty points</p>
                        <p className="mt-1 text-sm font-semibold text-[#202124]">{user?.loyaltyPoints || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

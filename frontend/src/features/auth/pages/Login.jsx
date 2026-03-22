import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Card from "../../../components/ui/Card";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../authSlice";
import { LOGO } from "../../../assets";
import { getDefaultRouteForRole } from "../../../utils/roleRouting";
import { getUserFromAuthPayload } from "../../../utils/helpers";

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [form, setForm] = useState({ contactNumber: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.contactNumber || !form.password) {
      setError("Please fill in both contact number and password.");
      return;
    }

    setLoading(true);

    try {
      const payload = await loginUser(form);
      const user = getUserFromAuthPayload(payload);
      navigate(getDefaultRouteForRole(user), { replace: true });
    } catch (submitError) {
      setError(submitError?.friendlyMessage || submitError?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#e8f0fe_0%,_#f8f9fc_45%,_#f1f3f4_100%)] px-4 py-10">
      <div className="w-full max-w-xl space-y-4">
        <div className="text-center">
          <img src={LOGO} alt="CTSE Logo" className="object-contain h-auto mx-auto w-60" />
          <p className="mt-2 text-sm text-[#5f6368]">
            One secure login for customer shopping, admin operations, and delivery work.
          </p>
        </div>

        <Card title="Sign In" subtitle="Use contact number and password">
          <LoginForm
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />

          <p className="mt-4 text-sm text-[#5f6368]">
            New to this workspace?{" "}
            <NavLink to="/register" className="font-semibold text-[#1a73e8] hover:underline">
              Create an account
            </NavLink>
          </p>
        </Card>
      </div>
    </div>
  );
}

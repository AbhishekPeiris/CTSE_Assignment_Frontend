import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Card from "../../../components/ui/Card";
import RegisterForm from "../components/RegisterForm";
import { useAuth } from "../authSlice";
import { getTokenFromAuthPayload } from "../../../utils/helpers";
import { LOGO } from "../../../assets";

export default function Register() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
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

    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const payload = await registerUser(form);
      const token = getTokenFromAuthPayload(payload);

      navigate(token ? "/" : "/login", { replace: true });
    } catch (submitError) {
      setError(submitError?.friendlyMessage || submitError?.message || "Registration failed");
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
            Register a role to access microservice operations.
          </p>
        </div>

        <Card title="Register" subtitle="Provision account in auth service">
          <RegisterForm
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />

          <p className="mt-4 text-sm text-[#5f6368]">
            Already have an account?{" "}
            <NavLink to="/login" className="font-semibold text-[#1a73e8] hover:underline">
              Sign in
            </NavLink>
          </p>
        </Card>
      </div>
    </div>
  );
}

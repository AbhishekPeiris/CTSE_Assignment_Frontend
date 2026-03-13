import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import ErrorMessage from "../../../components/ui/ErrorMessage";

export default function RegisterForm({ form, onChange, onSubmit, loading, error }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Name"
        type="text"
        name="name"
        value={form.name}
        required
        autoComplete="name"
        onChange={onChange}
      />

      <Input
        label="Email"
        type="email"
        name="email"
        value={form.email}
        required
        autoComplete="email"
        onChange={onChange}
      />

      <Input
        label="Password"
        type="password"
        name="password"
        value={form.password}
        required
        autoComplete="new-password"
        onChange={onChange}
      />

      <div>
        <label htmlFor="register-role" className="mb-1 block text-sm font-medium text-[#374151]">
          Role
        </label>
        <select
          id="register-role"
          name="role"
          value={form.role}
          onChange={onChange}
          className="w-full rounded-xl border border-[#d9dde8] bg-white px-3 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc]"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="DELIVERY">DELIVERY</option>
        </select>
      </div>

      <ErrorMessage message={error} />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}

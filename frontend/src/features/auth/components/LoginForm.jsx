import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import ErrorMessage from "../../../components/ui/ErrorMessage";

export default function LoginForm({ form, onChange, onSubmit, loading, error }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="Enter your email"
        value={form.email}
        required
        autoComplete="email"
        onChange={onChange}
      />

      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        value={form.password}
        required
        autoComplete="current-password"
        onChange={onChange}
      />

      <ErrorMessage message={error} />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}

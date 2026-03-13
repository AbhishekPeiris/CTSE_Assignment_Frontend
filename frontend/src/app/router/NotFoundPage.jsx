import { NavLink } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl py-8">
      <Card title="404" subtitle="The route you requested does not exist.">
        <NavLink to="/">
          <Button>Back to Dashboard</Button>
        </NavLink>
      </Card>
    </div>
  );
}

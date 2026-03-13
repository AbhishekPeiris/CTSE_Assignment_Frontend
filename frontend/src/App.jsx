import AppRouter from "./app/router/AppRouter";
import { AppProvider } from "./app/providers/AppProvider";

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

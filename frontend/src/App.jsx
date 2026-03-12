import AppRouter from "./app/router/AppRouter";
import { AppProvider } from "./app/providers/AppProvider";
import { AuthProvider } from "./features/auth/authSlice";
import { ProductProvider } from "./features/products/productSlice";
import { OrderProvider } from "./features/orders/orderSlice";

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <ProductProvider>
          <OrderProvider>
            <AppRouter />
          </OrderProvider>
        </ProductProvider>
      </AuthProvider>
    </AppProvider>
  );
}

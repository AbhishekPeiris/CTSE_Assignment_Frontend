import { useCallback, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Loader from "../../../components/ui/Loader";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import StatusPill from "../../../components/ui/StatusPill";
import { ProductService } from "../../../services/product.service";
import { asEntity, formatMoney, resolveRole } from "../../../utils/helpers";
import { useAppContext } from "../../../app/providers/AppProvider";

export default function ProductDetails() {
  const { id } = useParams();
  const { auth } = useAppContext();
  const role = resolveRole(auth?.user);
  const canReserve = ["ADMIN", "USER", "DELIVERY"].includes(role);

  const [state, setState] = useState({ loading: true, error: "", product: null });
  const [actionLoading, setActionLoading] = useState("");
  const [actionError, setActionError] = useState("");

  const loadProduct = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await ProductService.getProductById(id);
      setState({
        loading: false,
        error: "",
        product: asEntity(response, ["product"]),
      });
    } catch (error) {
      setState({
        loading: false,
        error: error?.friendlyMessage || error?.message || "Failed to load product",
        product: null,
      });
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleReserve = async () => {
    setActionLoading("reserve");
    setActionError("");

    try {
      await ProductService.reserveProduct(id);
      await loadProduct();
    } catch (error) {
      setActionError(error?.friendlyMessage || error?.message || "Reserve request failed");
    } finally {
      setActionLoading("");
    }
  };

  const handleRelease = async () => {
    setActionLoading("release");
    setActionError("");

    try {
      await ProductService.releaseProduct(id);
      await loadProduct();
    } catch (error) {
      setActionError(error?.friendlyMessage || error?.message || "Release request failed");
    } finally {
      setActionLoading("");
    }
  };

  if (state.loading) {
    return <Loader text="Loading product..." />;
  }

  return (
    <Card title="Product Details" subtitle="Detailed view from product service">
      <div className="mb-5">
        <NavLink to="/products">
          <Button variant="secondary" size="sm">
            Back to Products
          </Button>
        </NavLink>
      </div>

      <ErrorMessage message={state.error} />
      <ErrorMessage message={actionError} />

      {!state.error && !state.product ? (
        <p className="text-sm text-[#6b7280]">Product not found.</p>
      ) : null}

      {state.product ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl font-semibold text-[#1f2937]">{state.product.name || "Product"}</h3>
            <StatusPill status={state.product.status || "AVAILABLE"} />
          </div>

          <p className="text-[#5f6368]">{state.product.description || "No description"}</p>

          <div className="grid gap-3 rounded-xl border border-[#edf0f7] bg-[#fcfdff] p-4 md:grid-cols-2">
            <p className="text-sm text-[#3c4043]">ID: {state.product._id || state.product.id || "N/A"}</p>
            <p className="text-sm text-[#3c4043]">Price: {formatMoney(state.product.price)}</p>
            <p className="text-sm text-[#3c4043]">
              Stock: {state.product.stock ?? state.product.quantity ?? state.product.availableQuantity ?? "N/A"}
            </p>
            <p className="text-sm text-[#3c4043]">Category: {state.product.category || "N/A"}</p>
          </div>

          {canReserve ? (
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleReserve} disabled={actionLoading === "reserve"}>
                Reserve
              </Button>
              <Button
                variant="secondary"
                onClick={handleRelease}
                disabled={actionLoading === "release"}
              >
                Release
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

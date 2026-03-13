import { useCallback, useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Loader from "../../../components/ui/Loader";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";
import { ProductService } from "../../../services/product.service";
import { asCollection, resolveRole } from "../../../utils/helpers";
import { useAppContext } from "../../../app/providers/AppProvider";

export default function ProductList() {
  const { auth } = useAppContext();
  const role = resolveRole(auth?.user);
  const canCreate = role === "ADMIN";
  const canReserve = ["ADMIN", "USER", "DELIVERY"].includes(role);

  const [state, setState] = useState({ loading: true, error: "", items: [] });
  const [actionError, setActionError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    price: "",
  });

  const loadProducts = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await ProductService.getAllProducts();
      setState({
        loading: false,
        error: "",
        items: asCollection(response, ["products"]),
      });
    } catch (error) {
      setState({
        loading: false,
        error: error?.friendlyMessage || error?.message || "Failed to load products",
        items: [],
      });
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCreateChange = (event) => {
    setCreateForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setActionError("");

    if (!createForm.name || !createForm.description || !createForm.price) {
      setActionError("Name, description and price are required.");
      return;
    }

    setCreateLoading(true);

    try {
      await ProductService.createProduct({
        name: createForm.name,
        description: createForm.description,
        price: Number(createForm.price),
      });

      setCreateForm({ name: "", description: "", price: "" });
      await loadProducts();
    } catch (error) {
      setActionError(error?.friendlyMessage || error?.message || "Failed to create product");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleReserve = async (productId) => {
    setActionError("");
    setActionLoadingId(`reserve:${productId}`);

    try {
      await ProductService.reserveProduct(productId);
      await loadProducts();
    } catch (error) {
      setActionError(error?.friendlyMessage || error?.message || "Reserve request failed");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleRelease = async (productId) => {
    setActionError("");
    setActionLoadingId(`release:${productId}`);

    try {
      await ProductService.releaseProduct(productId);
      await loadProducts();
    } catch (error) {
      setActionError(error?.friendlyMessage || error?.message || "Release request failed");
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <Card title="Products" subtitle="GET / POST / PATCH operations against product service">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-[#5f6368]">Catalog and inventory controls</p>
        <Button variant="secondary" onClick={loadProducts}>
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        <ErrorMessage message={state.error} />
        <ErrorMessage message={actionError} />
      </div>

      {canCreate ? (
        <div className="mb-5 mt-5">
          <ProductForm
            form={createForm}
            onChange={handleCreateChange}
            onSubmit={handleCreateProduct}
            loading={createLoading}
          />
        </div>
      ) : null}

      {state.loading ? <Loader text="Loading products..." /> : null}

      {!state.loading && state.items.length === 0 ? (
        <p className="text-sm text-[#6b7280]">No products found.</p>
      ) : null}

      {!state.loading && state.items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {state.items.map((product, index) => (
            <ProductCard
              key={product?._id || product?.id || `product-${index}`}
              product={product}
              canReserve={canReserve}
              actionLoadingId={actionLoadingId}
              onReserve={handleReserve}
              onRelease={handleRelease}
            />
          ))}
        </div>
      ) : null}
    </Card>
  );
}

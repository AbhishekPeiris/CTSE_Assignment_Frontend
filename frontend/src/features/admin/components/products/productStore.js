import { useState } from "react";
import { ProductService } from "../../../../services/product.service";
import { resolveEntityId } from "../../../../utils/helpers";

const INITIAL_PRODUCT_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  imageUrl: "",
};

export function useProductStore({ runAction, setError, loadProducts }) {
  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleProductCreate = async () => {
    if (!productForm.name.trim() || !productForm.description.trim()) {
      setError("Product name and description are required.");
      return;
    }

    await runAction(
      "create-product",
      async () => {
        await ProductService.createProduct({
          name: productForm.name.trim(),
          description: productForm.description.trim(),
          price: Number(productForm.price || 0),
          stock: Number(productForm.stock || 0),
          category: productForm.category.trim(),
          imageUrl: productForm.imageUrl.trim() || undefined,
        });

        setProductForm(INITIAL_PRODUCT_FORM);
        await loadProducts();
      },
      "Product created.",
    );
  };

  const handleProductUpdate = async () => {
    if (!editingProduct) {
      return;
    }

    const productId = resolveEntityId(editingProduct);

    await runAction(
      `update-product:${productId}`,
      async () => {
        await ProductService.updateProduct(productId, {
          name: editingProduct.name,
          description: editingProduct.description,
          price: Number(editingProduct.price),
          stock: Number(editingProduct.stock),
          category: editingProduct.category,
          imageUrl: editingProduct.imageUrl || undefined,
        });

        setEditingProduct(null);
        await loadProducts();
      },
      "Product updated.",
    );
  };

  const handleProductDelete = async (productId) => {
    await runAction(
      `delete-product:${productId}`,
      async () => {
        await ProductService.deleteProduct(productId);
        await loadProducts();
      },
      "Product deleted.",
    );
  };

  return {
    productForm,
    setProductForm,
    editingProduct,
    setEditingProduct,
    handleProductCreate,
    handleProductUpdate,
    handleProductDelete,
  };
}

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import CategorySection from "./component/CategorySection";
import SelectProducts from "./component/SelectProducts";
import LocationPickerMap from "../../../../client/components/LocationPickerMap";
import { formatMoney, resolveEntityId } from "../../../../../utils/helpers";
import OrderSection from "./component/OrderSection";

const MakeOrder = ({
  orderForm,
  setOrderForm,
  orderCustomer,
  setOrderCustomer,
  products,
  handleAddItemToOrderDraft,
  handleLookupOrCreateOrderCustomer,
  handleCreateOrderByAdmin,
  actionLoading,
}) => {
  const categories = useMemo(() => {
    const grouped = new Map();

    products.forEach((product) => {
      const category = String(product?.category || "Uncategorized").trim();
      grouped.set(category, (grouped.get(category) || 0) + 1);
    });

    return Array.from(grouped.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [products]);

  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (!categories.length) {
      setSelectedCategory("");
      return;
    }

    if (!categories.some((category) => category.name === selectedCategory)) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) {
      return products;
    }

    return products.filter(
      (product) =>
        String(product?.category || "Uncategorized").trim() ===
        selectedCategory,
    );
  }, [products, selectedCategory]);

  const selectedProduct = useMemo(() => {
    return (
      products.find(
        (product) => resolveEntityId(product) === orderForm.selectedProductId,
      ) || null
    );
  }, [orderForm.selectedProductId, products]);

  const subtotal = useMemo(() => {
    return orderForm.items.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
  }, [orderForm.items]);

  const loyaltyBalance = Number(orderCustomer?.loyaltyPoints || 0);
  const requestedLoyaltyPoints = Math.max(
    0,
    Number(orderForm.loyaltyPointsToUse || 0),
  );
  const loyaltyRedemptionValue = Math.min(
    requestedLoyaltyPoints,
    loyaltyBalance,
  );
  const total = Math.max(0, subtotal - loyaltyRedemptionValue);
  const customerReady =
    !!orderCustomer &&
    orderCustomer.contactNumber === orderForm.customerContactNumber.trim();

  const handleCustomerFieldChange = (field, value) => {
    setOrderForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (
      (field === "customerContactNumber" &&
        value.trim() !== String(orderCustomer?.contactNumber || "").trim()) ||
      (field === "customerName" &&
        value.trim() !== String(orderCustomer?.name || "").trim())
    ) {
      setOrderCustomer(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-xl">
      <div className="grid min-h-[760px] gap-0 xl:grid-cols-[165px_minmax(0,1fr)_460px]">
        {/* Category Section */}
        <aside className="border-b border-line bg-white p-5 xl:border-b-0 xl:border-r">
          <CategorySection
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </aside>

        {/* Product Selection Section */}
        <SelectProducts
          filteredProducts={filteredProducts}
          selectedProduct={selectedProduct}
          orderForm={orderForm}
          setOrderForm={setOrderForm}
          handleAddItemToOrderDraft={handleAddItemToOrderDraft}
        />
        {/* Order Summary Section */}
        <OrderSection
          orderForm={orderForm}
          setOrderForm={setOrderForm}
          orderCustomer={orderCustomer}
          setOrderCustomer={setOrderCustomer}
          handleLookupOrCreateOrderCustomer={handleLookupOrCreateOrderCustomer}
          handleCreateOrderByAdmin={handleCreateOrderByAdmin}
          actionLoading={actionLoading}
          subtotal={subtotal}
          loyaltyBalance={loyaltyBalance}
          loyaltyRedemptionValue={loyaltyRedemptionValue}
          total={total}
          customerReady={customerReady}
        />
      </div>
    </div>
  );
};

MakeOrder.propTypes = {
  orderForm: PropTypes.object.isRequired,
  setOrderForm: PropTypes.func.isRequired,
  orderCustomer: PropTypes.object,
  setOrderCustomer: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
  handleAddItemToOrderDraft: PropTypes.func.isRequired,
  handleLookupOrCreateOrderCustomer: PropTypes.func.isRequired,
  handleCreateOrderByAdmin: PropTypes.func.isRequired,
  actionLoading: PropTypes.string.isRequired,
};

MakeOrder.defaultProps = {
  orderCustomer: null,
};

export default MakeOrder;

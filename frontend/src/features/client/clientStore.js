import { useSyncExternalStore } from "react";

const CLIENT_CART_STORAGE_KEY = "ctse_client_cart";

let clientState = {
  cart: {},
};

const listeners = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function saveToStorage() {
  try {
    localStorage.setItem(CLIENT_CART_STORAGE_KEY, JSON.stringify(clientState));
  } catch (error) {
    console.error("Failed to persist client cart state", error);
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(CLIENT_CART_STORAGE_KEY);

    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    const incomingCart = parsed?.cart;

    if (!incomingCart || typeof incomingCart !== "object") {
      return;
    }

    clientState = {
      cart: incomingCart,
    };
  } catch (error) {
    console.error("Failed to load client cart state", error);
    localStorage.removeItem(CLIENT_CART_STORAGE_KEY);
  }
}

function normalizeCartProduct(product) {
  return {
    id: product.id,
    name: product.name,
    price: Number(product.price || 0),
    imageUrl: product.imageUrl || "",
    category: product.category || "",
    stock: Number(product.stock || 0),
  };
}

loadFromStorage();

export const clientStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getState() {
    return clientState;
  },

  setItem(product, quantity) {
    if (!product?.id) {
      return;
    }

    const normalizedQuantity = Math.max(0, Number(quantity || 0));
    const nextCart = { ...clientState.cart };

    if (normalizedQuantity === 0) {
      delete nextCart[product.id];
    } else {
      nextCart[product.id] = {
        product: normalizeCartProduct(product),
        quantity: normalizedQuantity,
      };
    }

    clientState = {
      ...clientState,
      cart: nextCart,
    };

    saveToStorage();
    emitChange();
  },

  addItem(product, amount = 1) {
    if (!product?.id) {
      return;
    }

    const existingQuantity = Number(
      clientState.cart[product.id]?.quantity || 0,
    );
    this.setItem(product, existingQuantity + Number(amount || 1));
  },

  removeItem(productId) {
    if (!productId) {
      return;
    }

    const nextCart = { ...clientState.cart };
    delete nextCart[productId];

    clientState = {
      ...clientState,
      cart: nextCart,
    };

    saveToStorage();
    emitChange();
  },

  clearCart() {
    clientState = {
      ...clientState,
      cart: {},
    };

    saveToStorage();
    emitChange();
  },
};

export function useClientStore() {
  return useSyncExternalStore(
    clientStore.subscribe,
    clientStore.getState,
    clientStore.getState,
  );
}

export function getCartItems(state) {
  return Object.values(state?.cart || {});
}

export function getCartCount(state) {
  return getCartItems(state).reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );
}

export function getCartSubtotal(state) {
  return getCartItems(state).reduce(
    (sum, item) =>
      sum + Number(item.product?.price || 0) * Number(item.quantity || 0),
    0,
  );
}

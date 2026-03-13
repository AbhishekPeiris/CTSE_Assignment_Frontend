const AUTH_STORAGE_KEY = "ctse_auth";

let authState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) return;

    const parsed = JSON.parse(raw);

    authState = {
      user: parsed?.user ?? null,
      token: parsed?.token ?? null,
      isAuthenticated: Boolean(parsed?.token),
    };
  } catch (error) {
    console.error("Failed to read auth from localStorage:", error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        user: authState.user,
        token: authState.token,
      }),
    );
  } catch (error) {
    console.error("Failed to save auth to localStorage:", error);
  }
}

loadFromStorage();

export const authStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getState() {
    return authState;
  },

  setAuth(payload) {
    authState = {
      user: payload?.user ?? null,
      token: payload?.token ?? null,
      isAuthenticated: Boolean(payload?.token),
    };

    saveToStorage();
    notify();
  },

  updateUser(user) {
    authState = {
      ...authState,
      user,
    };

    saveToStorage();
    notify();
  },

  clearAuth() {
    authState = {
      user: null,
      token: null,
      isAuthenticated: false,
    };

    localStorage.removeItem(AUTH_STORAGE_KEY);
    notify();
  },

  getToken() {
    return authState.token;
  },

  getUser() {
    return authState.user;
  },

  isLoggedIn() {
    return authState.isAuthenticated;
  },
};

# Create frontend project root
cd frontend

# Root folders

# App
mkdir src/app
mkdir src/app/router
mkdir src/app/store
mkdir src/app/providers

New-Item src/app/router/AppRouter.jsx -ItemType File
New-Item src/app/store/authStore.js -ItemType File
New-Item src/app/providers/AppProvider.jsx -ItemType File

# API
mkdir src/api
New-Item src/api/apiClient.js -ItemType File
New-Item src/api/endpoints.js -ItemType File

# Services
mkdir src/services
New-Item src/services/auth.service.js -ItemType File
New-Item src/services/user.service.js -ItemType File
New-Item src/services/product.service.js -ItemType File
New-Item src/services/order.service.js -ItemType File
New-Item src/services/admin.service.js -ItemType File

# Features
mkdir src/features

# Auth
mkdir src/features/auth
mkdir src/features/auth/pages
mkdir src/features/auth/components

New-Item src/features/auth/pages/Login.jsx -ItemType File
New-Item src/features/auth/pages/Register.jsx -ItemType File
New-Item src/features/auth/components/LoginForm.jsx -ItemType File
New-Item src/features/auth/components/RegisterForm.jsx -ItemType File
New-Item src/features/auth/authSlice.js -ItemType File

# Products
mkdir src/features/products
mkdir src/features/products/pages
mkdir src/features/products/components

New-Item src/features/products/pages/ProductList.jsx -ItemType File
New-Item src/features/products/pages/ProductDetails.jsx -ItemType File
New-Item src/features/products/components/ProductCard.jsx -ItemType File
New-Item src/features/products/components/ProductForm.jsx -ItemType File
New-Item src/features/products/productSlice.js -ItemType File

# Orders
mkdir src/features/orders
mkdir src/features/orders/pages
mkdir src/features/orders/components

New-Item src/features/orders/pages/OrderList.jsx -ItemType File
New-Item src/features/orders/pages/OrderDetails.jsx -ItemType File
New-Item src/features/orders/components/OrderCard.jsx -ItemType File
New-Item src/features/orders/orderSlice.js -ItemType File

# Dashboard
mkdir src/features/dashboard
mkdir src/features/dashboard/pages
New-Item src/features/dashboard/pages/Dashboard.jsx -ItemType File

# Components
mkdir src/components
mkdir src/components/layout
mkdir src/components/ui

New-Item src/components/layout/Navbar.jsx -ItemType File
New-Item src/components/layout/Sidebar.jsx -ItemType File
New-Item src/components/layout/Footer.jsx -ItemType File

New-Item src/components/ui/Button.jsx -ItemType File
New-Item src/components/ui/Input.jsx -ItemType File
New-Item src/components/ui/Card.jsx -ItemType File
New-Item src/components/ui/Modal.jsx -ItemType File
New-Item src/components/ui/Loader.jsx -ItemType File

# Hooks
mkdir src/hooks
New-Item src/hooks/useAuth.js -ItemType File
New-Item src/hooks/useFetch.js -ItemType File

# Utils
mkdir src/utils
New-Item src/utils/constants.js -ItemType File
New-Item src/utils/helpers.js -ItemType File

# Styles
mkdir src/styles
New-Item src/styles/global.css -ItemType File

# Root files
New-Item src/App.jsx -ItemType File
New-Item src/main.jsx -ItemType File

New-Item .env -ItemType File
New-Item package.json -ItemType File
New-Item vite.config.js -ItemType File

Write-Host "Frontend structure created successfully!"
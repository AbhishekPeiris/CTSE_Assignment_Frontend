# CTSE_Assignment_Frontend

frontend
│
├── public
│
├── src
│
│   ├── app
│   │   ├── router
│   │   │   └── AppRouter.jsx
│   │   │
│   │   ├── store
│   │   │   └── authStore.js
│   │   │
│   │   └── providers
│   │       └── AppProvider.jsx
│   │
│   │
│   ├── api
│   │   ├── apiClient.js
│   │   └── endpoints.js
│   │
│   │
│   ├── services
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── product.service.js
│   │   ├── order.service.js
│   │   └── admin.service.js
│   │
│   │
│   ├── features
│   │
│   │   ├── auth
│   │   │   ├── pages
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   │
│   │   │   ├── components
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegisterForm.jsx
│   │   │   │
│   │   │   └── authSlice.js
│   │   │
│   │   │
│   │   ├── products
│   │   │   ├── pages
│   │   │   │   ├── ProductList.jsx
│   │   │   │   └── ProductDetails.jsx
│   │   │   │
│   │   │   ├── components
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   └── ProductForm.jsx
│   │   │   │
│   │   │   └── productSlice.js
│   │   │
│   │   │
│   │   ├── orders
│   │   │   ├── pages
│   │   │   │   ├── OrderList.jsx
│   │   │   │   └── OrderDetails.jsx
│   │   │   │
│   │   │   ├── components
│   │   │   │   └── OrderCard.jsx
│   │   │   │
│   │   │   └── orderSlice.js
│   │   │
│   │   │
│   │   └── dashboard
│   │       └── pages
│   │           └── Dashboard.jsx
│   │
│   │
│   ├── components
│   │   ├── layout
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Footer.jsx
│   │   │
│   │   ├── ui
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Loader.jsx
│   │
│   │
│   ├── hooks
│   │   ├── useAuth.js
│   │   └── useFetch.js
│   │
│   │
│   ├── utils
│   │   ├── constants.js
│   │   └── helpers.js
│   │
│   │
│   ├── styles
│   │   └── global.css
│   │
│   │
│   ├── App.jsx
│   └── main.jsx
│
│
├── .env
├── package.json
└── vite.config.js
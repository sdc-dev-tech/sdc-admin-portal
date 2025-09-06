import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Categories from "./pages/Categories";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Notification from "./pages/Notification";
import TokenRefresh from "./components/TokenRefresh";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light">
          <TokenRefresh />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/new" element={<ProductForm />} />
                <Route path="/notification" element={<Notification />} />
                <Route
                  path="/products/edit/:id/:categoryId/:subcategoryId"
                  element={<ProductForm />}
                />
                <Route path="/users" element={<Users />} />
                <Route path="/users/:id" element={<UserDetail />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/categories" element={<Categories />} />
              </Route>
            </Route>
          </Routes>
          <Toaster />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

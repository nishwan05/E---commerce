import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import CategoryPage from "../pages/CategoryPage";
import CheckoutPage from "../pages/CheckoutPage";
import CartCheckoutPage from "../pages/CartCheckoutPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import SignupPage from "../pages/SignupPage";
import LoginPage from "../pages/LoginPage";
import UserDetails from "../pages/UserDetails";
import SuperAdminPage from "../pages/SuperAdminPage";
import PermissionRoute from "./PermissionRoute";
import SuperAdminRoute from "./SuperAdminRoute";
import AdminRoute from "./AdminRouter";
import SupportTable from "../components/SupportTable";
import SupportChatPage from "../pages/SupportPage";
import RequestPage from "../pages/RequestPage";
import OrdersPage from "../pages/OrdersPage";
import OrderDetailPage from "../pages/OrderDetailsPage";
import AdminOrdersPage from "../pages/AdminOrdersPage";
import NotFoundPage from "../pages/NotFoundPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route
      path="/mobiles"
      element={
        <PermissionRoute page="mobiles">
          <CategoryPage category="mobile" title="Mobiles" />
        </PermissionRoute>
      }
    />
    <Route
      path="/electronics"
      element={
        <PermissionRoute page="electronics">
          <CategoryPage category="electronics" title="Electronics" />
        </PermissionRoute>
      }
    />
    <Route
      path="/fashion"
      element={
        <PermissionRoute page="fashion">
          <CategoryPage category="fashion" title="Fashion" />
        </PermissionRoute>
      }
    />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/cart-checkout" element={<CartCheckoutPage />} />
    <Route path="/product/:category/:id" element={<ProductDetailPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/users"
      element={
        <PermissionRoute page="users">
          <UserDetails />
        </PermissionRoute>
      }
    />
    <Route
      path="/manageaccess"
      element={
        <SuperAdminRoute>
          <SuperAdminPage />
        </SuperAdminRoute>
      }
    />
    <Route path="/support" element={<SupportTable />} />
    <Route path="/support/:ticketId" element={<SupportChatPage />} />
    <Route path="/requests" element={<RequestPage />} />

    <Route path="/orders" element={<OrdersPage />} />
    <Route path="/orders/:id" element={<OrderDetailPage />} />
    <Route
      path="/admin/orders"
      element={
        <AdminRoute>
          <AdminOrdersPage />
        </AdminRoute>
      }
    />

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;

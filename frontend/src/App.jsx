import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppRoutes from "./routes/ProductRoutes";
import Navbar from "./components/Navbar";
import CartSync from "./features/cart/CartSync";
import { ProductProvider } from "./context/Product";
import { AccessProvider } from "./context/AccessContext";
import { fetchCurrentUser } from "./features/auth/authSlice";

const Layout = () => {
  const location = useLocation();
  const hideNavbar = ["/login", "/signup"].includes(location.pathname);
  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="page-content">
        <AppRoutes />
      </div>
    </>
  );
};

const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);
  return (
    <BrowserRouter>
      <AccessProvider>
        <CartSync />
        <ProductProvider>
          <Layout />
        </ProductProvider>
      </AccessProvider>
    </BrowserRouter>
  );
};

export default App;

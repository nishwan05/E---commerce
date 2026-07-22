import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import AppRoutes from "./routes/ProductRoutes";
import Navbar from "./components/Navbar";
import CartSync from "./features/cart/CartSync";
import { ProductProvider } from "./context/Product";
import { AccessProvider } from "./context/AccessContext";
import SearchBar from "./components/SearchBar";
import { socket } from "./socket";
import { fetchCurrentUser } from "./features/auth/authSlice";

const Layout = () => {
  const location = useLocation();
  const hideNavbar = ["/login", "/signup"].includes(location.pathname);
  const showSearch = ["/", "/mobiles", "/electronics", "/fashion"].includes(
    location.pathname,
  );

  return (
    <>
      {!hideNavbar && <Navbar />}
      {!hideNavbar && showSearch && <SearchBar />}
      <div className="page-content">
        <AppRoutes />
      </div>
    </>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const { user, authLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (authLoading) return;

    socket.disconnect();
    socket.connect();

    const joinUserRoom = () => {
      if (!user?.id) return;
      socket.emit("joinUserRoom", user.id);
    };

    socket.on("connect", joinUserRoom);
    joinUserRoom();

    return () => {
      socket.off("connect", joinUserRoom);
    };
  }, [authLoading, user?.id]);
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

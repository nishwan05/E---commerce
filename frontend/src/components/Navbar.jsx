import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Button, Badge, Input, Select, Divider, message } from "antd";
import { useMemo } from "react";
import { useAccess } from "../context/AccessContext";
import { getPages } from "../api/pageApi";
import { ShoppingCartOutlined, PlusOutlined, LogoutOutlined, FileTextOutlined } from "@ant-design/icons";
import { useCart } from "../features/cart/useCart";
import { useProducts } from "../context/Product";
import ProductModal from "./ProductModal";
import CartDrawer from "./CartDrawer";
import { useSelector, useDispatch } from "react-redux";
import debounce from "lodash/debounce";
import { logout } from "../features/auth/authSlice";

const { Header } = Layout;

const categoryMap = {
  "/mobiles": "mobile",
  "/electronics": "electronics",
  "/fashion": "fashion",
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const currentCategory = categoryMap[location.pathname] || null;
  const { totalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const { fetchProducts, fetchBrands, handleSort, sortOrder, resetFilters } = useProducts();
  const { hasAccess } = useAccess();

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        if (value.trim()) {
          fetchProducts({ search: value, ...(currentCategory && { category: currentCategory }) });
        } else {
          fetchProducts(currentCategory ? { category: currentCategory } : {});
        }
      }, 300),
    [fetchProducts, currentCategory]
  );

  useEffect(() => { return () => { debouncedSearch.cancel(); }; }, [debouncedSearch]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await getPages();
        setPages(res.data.data);
      } catch {
        message.error("Failed to load pages");
      }
    };
    fetchPages();
  }, []);

  const isAdmin = ["admin", "superadmin"].includes(user?.role);
  const isSuperAdmin = user?.role === "superadmin";

  const visiblePages = pages.filter((page) => {
    if (!user) return false;
    return hasAccess(user.role, page.key);
  });

  return (
    <>
      <Header className="navbar">
        <div
          className="navbar-logo"
          onClick={() => { resetFilters({}); fetchProducts(); fetchBrands(); navigate("/"); }}
        >
          EVEREST
        </div>

        <nav className="navbar-menu">
          <span
            className={location.pathname === "/" ? "nav-active" : ""}
            onClick={() => { resetFilters({}); fetchProducts(); fetchBrands(); navigate("/"); }}
          >
            Home
          </span>

          {visiblePages.map((page) => (
            <span
              key={page._id}
              className={location.pathname === page.path ? "nav-active" : ""}
              onClick={() => navigate(page.path)}
            >
              {page.label}
            </span>
          ))}

          {/* My Orders — visible to logged-in non-admin users */}
          {user && !isAdmin && (
            <span
              className={location.pathname === "/orders" ? "nav-active" : ""}
              onClick={() => navigate("/orders")}
            >
              My Orders
            </span>
          )}

          {/* Raise Request — visible to logged-in non-admin users */}
          {user && !isAdmin && (
            <Button type="primary" onClick={() => navigate("/requests")}>
              Raise Request
            </Button>
          )}
        </nav>

        <div className="navbar-controls">
          {isSuperAdmin && (
            <Button onClick={() => navigate("/manageaccess")}>Manage Access</Button>
          )}

          <Input.Search
            className="navbar-search"
            placeholder="Search products..."
            allowClear
            onChange={(e) => debouncedSearch(e.target.value)}
          />

          <Select
            className="navbar-sort"
            placeholder="Sort by"
            value={sortOrder}
            onClear={() => handleSort(null)}
            onChange={(value) => handleSort(value)}
            style={{ width: 160 }}
            options={[
              { label: "Default", value: "default" },
              { label: "Name: A → Z", value: "name-asc" },
              { label: "Name: Z → A", value: "name-desc" },
              { label: "Price: Low → High", value: "price-asc" },
              { label: "Price: High → Low", value: "price-desc" },
            ]}
          />

          {isAdmin && <Button onClick={() => navigate("/support")}>Support</Button>}

          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              Add Product
            </Button>
          )}

          <Divider orientation="vertical" className="navbar-divider" />

          {user ? (
            <>
              <span className="navbar-username">Hi, {user?.name?.split(" ")[0] || "User"}</span>
              <Button
                icon={<LogoutOutlined />}
                className="navbar-ghost-btn"
                loading={logoutLoading}
                onClick={async () => {
                  try {
                    setLogoutLoading(true);
                    await dispatch(logout()).unwrap();
                    localStorage.removeItem("cart");
                    resetFilters({});
                    handleSort(null);
                    message.success("Logout successful");
                    navigate("/");
                  } catch {
                    message.error("Logout failed");
                  } finally {
                    setLogoutLoading(false);
                  }
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button className="navbar-ghost-btn" onClick={() => navigate("/login")}>Login</Button>
          )}

          {!isAdmin && (
            <Badge count={totalItems} showZero>
              <Button icon={<ShoppingCartOutlined />} onClick={() => setCartOpen(true)} />
            </Badge>
          )}
        </div>
      </Header>

      <ProductModal
        open={modalOpen}
        mode="create"
        onClose={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;
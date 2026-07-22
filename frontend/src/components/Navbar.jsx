import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Button, Badge, Divider, message, Dropdown, Avatar } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  LogoutOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import { useAccess } from "../context/AccessContext";
import { getPages } from "../api/pageApi";
import { useCart } from "../features/cart/useCart";
import { useProducts } from "../context/Product";
import ProductModal from "./ProductModal";
import CartDrawer from "./CartDrawer";
import NotificationBell from "./NotificationBell";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { getMediaUrl } from "../utils/media";

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { totalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const { fetchProducts, fetchBrands, resetFilters } = useProducts();
  const { hasAccess } = useAccess();

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

  const goHome = () => {
    resetFilters({});
    fetchProducts();
    fetchBrands();
    navigate("/");
  };

  const isAdmin = ["admin", "superadmin"].includes(user?.role);
  const isSuperAdmin = user?.role === "superadmin";

  const visiblePages = pages.filter((page) => {
    if (!user) return false;
    return hasAccess(user.role, page.key);
  });

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await dispatch(logout()).unwrap();
      localStorage.removeItem("cart");
      resetFilters({});
      message.success("Logout successful");
      navigate("/");
    } catch {
      message.error("Logout failed");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <>
      <Header className="navbar">
        <div className="navbar-primary">
          <button className="navbar-logo" type="button" onClick={goHome}>
            EVEREST
          </button>

          <nav className="navbar-menu">
            <button
              type="button"
              className={location.pathname === "/" ? "nav-active" : ""}
              onClick={goHome}
            >
              Home
            </button>

            {visiblePages.map((page) => (
              <button
                key={page._id}
                type="button"
                className={location.pathname === page.path ? "nav-active" : ""}
                onClick={() => navigate(page.path)}
              >
                {page.label}
              </button>
            ))}

            {user && !isAdmin && (
              <Button type="primary" onClick={() => navigate("/requests")}>
                Raise Request
              </Button>
            )}
          </nav>
        </div>

        <div className="navbar-controls">
          {isSuperAdmin && (
            <Button onClick={() => navigate("/manageaccess")}>
              Manage Access
            </Button>
          )}

          {isAdmin && (
            <Button onClick={() => navigate("/support")}>Support</Button>
          )}

          {user && hasAccess(user.role, "orders") && (
            <Button
              icon={<OrderedListOutlined />}
              onClick={() => navigate("/admin/orders")}
            >
              Orders
            </Button>
          )}

          {isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
            >
              Add Product
            </Button>
          )}

          <Divider orientation="vertical" className="navbar-divider" />

          {user && <NotificationBell />}

          {user ? (
            <Dropdown
              placement="bottomRight"
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "profile-header",
                    label: (
                      <div style={{ padding: "4px 0", minWidth: 180 }}>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>
                          {user.email}
                        </div>
                      </div>
                    ),
                    disabled: true,
                  },
                  { type: "divider" },
                  {
                    key: "profile",
                    icon: <UserOutlined />,
                    label: "My Profile",
                    onClick: () => navigate("/profile"),
                  },
                  {
                    key: "orders",
                    icon: <ShoppingOutlined />,
                    label: "My Orders",
                    onClick: () => navigate("/orders"),
                  },
                  { type: "divider" },
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: logoutLoading ? "Logging out..." : "Logout",
                    danger: true,
                    onClick: handleLogout,
                  },
                ],
              }}
            >
              <Avatar
                icon={<UserOutlined />}
                src={getMediaUrl(user.profilePicture)}
                style={{ cursor: "pointer", background: "#1677ff" }}
              />
            </Dropdown>
          ) : (
            <Button className="navbar-ghost-btn" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}

          <Badge count={totalItems} showZero>
            <Button
              icon={<ShoppingCartOutlined />}
              onClick={() => setCartOpen(true)}
            />
          </Badge>
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

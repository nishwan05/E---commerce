import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Divider, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useCart } from "../features/cart/useCart";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

const ProductDetailPage = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isAdmin = ["admin", "superadmin"].includes(user?.role);
  const { addToCart, cartItems } = useCart();
  const [product, setProduct] = useState(state?.product || null);

  const cartItem = cartItems.find((item) => item._id === product?._id);

  useEffect(() => {
    if (!state?.product) {
      axios
        .get(`http://localhost:5001/api/products/${id}`)
        .then((res) => setProduct(res?.data?.data || null))
        .catch(() => setProduct(null));
    }
  }, [id, state]);

  if (!product) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <Text type="secondary">Product not found.</Text>
        <br />
        <Button type="link" onClick={() => navigate("/")}>
          Go back to Home
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px" }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 24, paddingLeft: 0 }}
      >
        Back
      </Button>

      <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
        <div
          style={{
            flex: "0 0 420px",
            maxWidth: "100%",
            background: "#f5f5f5",
            borderRadius: 12,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
          }}
        >
          <img
            src={`http://localhost:5001${product.image}`}
            alt={product.name}
            style={{
              width: "100%",
              height: 420,
              objectFit: "contain",
              padding: 16,
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <Tag
            color="blue"
            style={{ marginBottom: 8, textTransform: "capitalize" }}
          >
            {product.category}
          </Tag>
          <Title level={2} style={{ marginBottom: 4 }}>
            {product.name}
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Brand: <strong>{product.brand}</strong>
          </Text>
          <Divider style={{ margin: "16px 0" }} />
          <Title level={3} style={{ color: "#ff6a00", marginBottom: 4 }}>
            ₹ {product.price?.toLocaleString()}
          </Title>
          <Text
            style={{
              fontSize: 13,
              color: product.stock > 0 ? "#52c41a" : "#ff4d4f",
            }}
          >
            {product.stock > 0
              ? `In Stock (${product.stock} available)`
              : "Out of Stock"}
          </Text>
          <Divider style={{ margin: "16px 0" }} />

          {product.description && (
            <>
              <Title level={5} style={{ marginBottom: 8 }}>
                Description
              </Title>
              <Text style={{ fontSize: 15, lineHeight: 1.8, color: "#444" }}>
                {product.description}
              </Text>
              <Divider style={{ margin: "16px 0" }} />
            </>
          )}

          {!isAdmin && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
              >
                Add to Cart
              </Button>

              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined />}
                onClick={() => {
                  if (!user) {
                    message.info("Please login to continue purchase", 3);
                    navigate("/login");
                  } else {
                    navigate("/checkout", {
                      state: {
                        product,
                        quantity: cartItem ? cartItem.quantity : 1,
                      },
                    });
                  }
                }}
                disabled={product.stock === 0}
                style={{ background: "#ff6a00", borderColor: "#ff6a00" }}
              >
                Buy Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

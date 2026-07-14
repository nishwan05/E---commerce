import { useState } from "react";
import { Card, Button, Popconfirm, message } from "antd";
import { useCart } from "../features/cart/useCart";
import { useProducts } from "../context/Product";
import ProductModal from "./ProductModal";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { cartItems, addToCart, increaseQuantity, decreaseQuantity } = useCart();
  const { removeProduct } = useProducts();
  const [editOpen, setEditOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const isAdmin = ["admin", "superadmin"].includes(user?.role);
  const cartItem = cartItems.find((item) => item._id === product?._id);

  return (
    <>
      <Card
        className="product-card"
        hoverable
        onClick={() => navigate(`/product/${product.category}/${product._id}`, { state: { product } })}
        cover={
          <img
            alt={product.name}
            src={product.image}
            style={{ height: "200px", objectFit: "contain" }}
          />
        }
      >
        <h3>{product.name}</h3>
        <p className="price">₹ {product.price}</p>
        <p>Stock: {product.stock > 0 ? product.stock : "Out Of Stock"}</p>

        {product.stock > 0 && product.stock <= 5 && (
          <p style={{ color: "red" }}>Only {product.stock} left</p>
        )}

        <div style={{ display: "flex", flexDirection: "row", gap: "8px", flexWrap: "wrap" }}>
          {cartItem ? (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <Button onClick={() => decreaseQuantity(product._id)}>-</Button>
              <Button>{cartItem.quantity}</Button>
              <Button
                disabled={cartItem.quantity >= product.stock}
                onClick={() => increaseQuantity(product._id)}
              >
                +
              </Button>
            </div>
          ) : (
            <Button
              type="primary"
              disabled={product.stock <= 0}
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            >
              {product.stock > 0 ? "Add To Cart" : "Out of Stock"}
            </Button>
          )}

          <Button
            type="primary"
            disabled={product.stock <= 0}
            onClick={(e) => {
              e.stopPropagation();
              if (!user) {
                message.info("Please login to continue purchase", 3);
                navigate("/login");
              } else {
                navigate("/checkout", {
                  state: { product, quantity: cartItem ? cartItem.quantity : 1 },
                });
              }
            }}
          >
            {product.stock > 0 ? "Buy Now" : "Out of Stock"}
          </Button>

          {isAdmin && (
            <>
              <Button onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}>Edit</Button>
              <div onClick={(e) => e.stopPropagation()}>
                <Popconfirm
                  title="Delete Product"
                  description="Are you sure you want to delete this product?"
                  onConfirm={() => removeProduct(product._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger>Delete</Button>
                </Popconfirm>
              </div>
            </>
          )}
        </div>
      </Card>

      <ProductModal
        open={editOpen}
        mode="edit"
        product={product}
        onClose={() => setEditOpen(false)}
        onSuccess={() => setEditOpen(false)}
      />
    </>
  );
};

export default ProductCard;

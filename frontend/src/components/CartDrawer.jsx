import { Drawer, Button, Divider, Typography, message } from "antd";
import { useCart } from "../features/cart/useCart";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const { Text } = Typography;

const CartDrawer = ({ open, onClose }) => {
  const { cartItems, increaseQuantity, decreaseQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isAdmin = ["admin", "superadmin"].includes(user?.role);

  const handleCheckout = () => {
    if (!user) { message.info("Please login to continue", 3); navigate("/login"); onClose(); return; }
    onClose();
    navigate("/cart-checkout");
  };

  return (
    <Drawer title={`Cart (${totalItems} items)`} placement="right" size="large" onClose={onClose} open={open}>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item._id}>
              <div className="cart-item">
                <h4>{item.name}</h4>
                <p>₹ {item.price}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Button onClick={() => decreaseQuantity(item._id)}>-</Button>
                  <span>{item.quantity}</span>
                  <Button disabled={item.quantity >= item.stock} onClick={() => increaseQuantity(item._id)}>+</Button>
                </div>
                <Button danger size="small" onClick={() => removeFromCart(item._id)} style={{ marginTop: "8px" }}>Remove</Button>
              </div>
              {item.stock <= 5 && item.stock > 0 && <p style={{ color: "red" }}>Only {item.stock} left</p>}
            </div>
          ))}
          <Divider />
          <h3 className="cart-total">Total: ₹ {totalPrice}</h3>
          {!isAdmin && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Button type="primary" size="large" style={{ width: "100%" }} onClick={handleCheckout}>Proceed to Checkout</Button>
              <Button danger onClick={clearCart} style={{ width: "100%" }}>Clear Cart</Button>
            </div>
          )}
        </>
      )}
    </Drawer>
  );
};

export default CartDrawer;

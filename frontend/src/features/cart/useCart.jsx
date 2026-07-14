import { useDispatch, useSelector } from "react-redux";
import { addToCart, clearCart, decreaseQuantity, increaseQuantity, removeFromCart } from "./cartSlice";

export const useCart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  return {
    cartItems,
    addToCart: (product) => dispatch(addToCart(product)),
    removeFromCart: (id) => dispatch(removeFromCart(id)),
    increaseQuantity: (id) => dispatch(increaseQuantity(id)),
    decreaseQuantity: (id) => dispatch(decreaseQuantity(id)),
    clearCart: () => dispatch(clearCart()),
    totalItems,
    totalPrice,
  };
};

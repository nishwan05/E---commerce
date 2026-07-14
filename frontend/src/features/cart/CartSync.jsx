import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadCart, saveCart } from "./cartSlice";
import { socket } from "../../socket";

const CartSync = () => {
  const dispatch = useDispatch();
  const { user, authLoading } = useSelector((state) => state.auth);
  const { cartItems, cartLoaded } = useSelector((state) => state.cart);
  const skipSaveRef = useRef(true);

  useEffect(() => {
    const handleCartUpdated = (payload = {}) => {
      if (!user) return;
      if (payload.userId && String(payload.userId) !== String(user.id)) return;
      skipSaveRef.current = true;
      dispatch(loadCart({ user })).finally(() => { setTimeout(() => { skipSaveRef.current = false; }, 0); });
    };
    socket.on("cartUpdated", handleCartUpdated);
    return () => socket.off("cartUpdated", handleCartUpdated);
  }, [dispatch, user]);

  useEffect(() => {
    if (authLoading) return;
    skipSaveRef.current = true;
    dispatch(loadCart({ user })).finally(() => { setTimeout(() => { skipSaveRef.current = false; }, 0); });
  }, [authLoading, dispatch, user]);

  useEffect(() => {
    if (!cartLoaded || skipSaveRef.current) return;
    dispatch(saveCart({ cartItems, user }));
  }, [cartItems, cartLoaded, dispatch, user]);

  return null;
};

export default CartSync;

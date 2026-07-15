import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import { getCart, updateCart } from "../../api/cartApi";

export const loadCart = createAsyncThunk(
  "cart/loadCart",
  async ({ user }, thunkAPI) => {
    try {
      if (user) {
        const res = await getCart();
        const cart = Array.isArray(res?.data) ? res.data : [];
        return cart
          .filter((item) => item?.productId)
          .map((item) => ({ ...item.productId, quantity: item.quantity }));
      }
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      message.error("Failed to load cart", 3);
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const saveCart = createAsyncThunk(
  "cart/saveCart",
  async ({ cartItems, user }) => {
    const items = Array.isArray(cartItems) ? cartItems : [];
    if (user) {
      await updateCart(
        items.map((item) => ({ productId: item._id, quantity: item.quantity })),
      );
      return;
    }
    localStorage.setItem("cart", JSON.stringify(items));
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState: { cartItems: [], cartLoaded: false },
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      if (!product?._id) return;
      if (product.stock <= 0) {
        message.error("Product is out of stock");
        return;
      }
      const existing = state.cartItems.find((item) => item._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          message.warning(`Only ${product.stock} item(s) available`);
          return;
        }
        existing.quantity += 1;
      } else {
        state.cartItems.push({ ...product, quantity: 1 });
      }
      message.success(`${product.name} added to cart`, 3);
    },
    removeFromCart(state, action) {
      state.cartItems = state.cartItems.filter(
        (item) => item._id !== action.payload,
      );
    },
    increaseQuantity(state, action) {
      const item = state.cartItems.find((item) => item._id === action.payload);
      if (!item) return;
      if (item.quantity >= item.stock) {
        message.warning("Maximum stock reached");
        return;
      }
      item.quantity += 1;
    },
    decreaseQuantity(state, action) {
      state.cartItems = state.cartItems
        .map((item) =>
          item._id === action.payload
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0);
    },
    clearCart(state) {
      state.cartItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCart.pending, (state) => {
        state.cartLoaded = false;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        const updatedCart = [];
        action.payload.forEach((item) => {
          if (item.stock === 0) {
            message.warning(
              `${item.name} is now out of stock and has been removed from your cart`,
            );
            return;
          }
          if (item.quantity > item.stock) {
            message.warning(
              `${item.name} quantity reduced to ${item.stock} because stock changed`,
            );
            updatedCart.push({ ...item, quantity: item.stock });
            return;
          }
          updatedCart.push(item);
        });
        state.cartItems = updatedCart;
        state.cartLoaded = true;
      })
      .addCase(loadCart.rejected, (state) => {
        state.cartItems = [];
        state.cartLoaded = true;
      });
  },
});

export const {
  addToCart,
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} = cartSlice.actions;
export default cartSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMe, logoutUser, loginUser } from "../../api/authApi";

export const login = createAsyncThunk("auth/login", async (credentials, thunkAPI) => {
  try {
    await loginUser(credentials);
    const res = await getMe();
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async (_, thunkAPI) => {
  try {
    const res = await getMe();
    return res.data;
  } catch { return thunkAPI.rejectWithValue(null); }
});

export const logout = createAsyncThunk("auth/logout", async () => { await logoutUser(); });

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, authLoading: true },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => { state.authLoading = true; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => { state.user = action.payload; state.authLoading = false; })
      .addCase(fetchCurrentUser.rejected, (state) => { state.user = null; state.authLoading = false; })
      .addCase(login.pending, (state) => { state.authLoading = true; })
      .addCase(login.fulfilled, (state, action) => { state.user = action.payload; state.authLoading = false; })
      .addCase(login.rejected, (state) => { state.authLoading = false; })
      .addCase(logout.fulfilled, (state) => { state.user = null; });
  },
});
export default authSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  user: {
    uuid: string;
    fname: string;
    lname: string;
    username?: string;
    email?: string;
    avatar?: string;
    status?: string;
  } | null;
  access_token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  access_token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ access_token: string; user: { uuid: string; fname: string; lname: string; email: string; avatar: string; status: string } }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.access_token = action.payload.access_token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.access_token = null;
    },
    setTokens: (state, action: PayloadAction<{ access_token: string;}>) => {
      state.access_token = action.payload.access_token;
    },
    setFirstName: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.fname = action.payload;
      }
    },
    setLastName: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.lname = action.payload;
      }
    },
  },
});

export const { login, logout, setTokens, setFirstName, setLastName } = authSlice.actions;

export default authSlice.reducer;

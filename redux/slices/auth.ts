import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    pharmacyId: string;
    isVerified: boolean;
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    test:(state) => {
      state.isAuthenticated = true;
      state.user = {
        id: 'test_user',
        firstName: 'test_firstName',
        lastName: 'test_lastName',
        role: 'test_role',
        isVerified: true,
        pharmacyId: 'test_pharmacyId',
      };
    },
    login: (state, action:
      PayloadAction<{ tokens: { accessToken: string; refreshToken: string; }
        user: { id: string; firstName: string; lastName: string; role: string; isVerified: boolean; pharmacyId: string; } }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.tokens.accessToken;
      state.refreshToken = action.payload.tokens.refreshToken;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    setFirstName: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.firstName = action.payload;
      }
    },
    setLastName: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.lastName = action.payload;
      }
    }
  },
});

export const { login, logout, test, setTokens,setFirstName, setLastName } = authSlice.actions;

export default authSlice.reducer;

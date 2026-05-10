import {
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthState {
  accessToken: string;
  refreshToken: string;
  user: User | null;
}

const initialState: AuthState = {
  accessToken: "",
  refreshToken: "",
  user: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setUser: (
      state,
      action: PayloadAction<AuthState>
    ) => {

      state.accessToken =
        action.payload.accessToken;

      state.refreshToken =
        action.payload.refreshToken;

      state.user =
        action.payload.user;
    },

    logout: (state) => {

      state.accessToken = "";

      state.refreshToken = "";

      state.user = null;
    },
  },
});

export const {
  setUser,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
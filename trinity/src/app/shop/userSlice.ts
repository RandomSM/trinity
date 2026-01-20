import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  user: { 
    email: string; 
    id: string; 
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    billing: {
      address: string | null;
      zipCode: string | null;
      city: string | null;
      country: string | null;
    };
    isAdmin: boolean;
  } | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ 
      email: string; 
      id: string; 
      firstName: string | null;
      lastName: string | null;
      phone: string | null;
      billing: {
        address: string | null;
        zipCode: string | null;
        city: string | null;
        country: string | null;
      };
      isAdmin: boolean;
    }>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;

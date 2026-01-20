import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}

interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export { userSlice };
export default userSlice.reducer;

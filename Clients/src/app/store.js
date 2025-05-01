import { configureStore } from "@reduxjs/toolkit";
import preferencesReducer from "../features/preferences/preferencesSlice";

export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
  },
});

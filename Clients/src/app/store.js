import { configureStore } from "@reduxjs/toolkit";
import preferencesReducer from "../features/preferences/preferencesSlice";
import jobsReducer from "../features/jobs/jobsSlice";

export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
    jobs: jobsReducer,
  },
});

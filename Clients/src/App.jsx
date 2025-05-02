import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./layouts/AppLayout";
import JobCard from "./components/JobCard";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Preference from "./pages/Preference";
import Recommendation from "./pages/Recommendation";
import EditPreference from "./pages/EditPreference";
import AddPreference from "./pages/AddPreferences";
import RegisterUser from "./pages/RegisterUser";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
        <Routes>
          <Route path="/home" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="/home/profile" element={<Profile />} />
            <Route path="/home/preference" element={<Preference />} />
            <Route path="/home/preference/add" element={<AddPreference />} />
            <Route path="/home/recommendation" element={<Recommendation />} />
            <Route
              path="/home/preference/edit/:id"
              element={<EditPreference />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

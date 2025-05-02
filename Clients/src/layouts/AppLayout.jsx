import { Navigate, Outlet } from "react-router";
import Navbar from "../components/Navbar";

export default function AppLayout() {
  if (!localStorage.getItem("access_token")) {
    return <Navigate to={"/"} />;
  }
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

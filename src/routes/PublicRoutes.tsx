import { Route, Routes } from "react-router-dom";
import { PUBLIC_ROUTES } from "@/config/routes.config";
import LandingPage from "@/pages/public/LandingPage";

export default function PublicRoutes() {
  return (
    <Routes>
      <Route element={<LandingPage />}>
        <Route path="/" element={null} />
        <Route path="/login/*" element={null} />
      </Route>
      {PUBLIC_ROUTES.filter(
        (route) => route.path !== "/" && route.path !== "/login/*",
      ).map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
          index={route.index}
        />
      ))}
    </Routes>
  );
}

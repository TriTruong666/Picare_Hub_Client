import { Navigate, Route, Routes } from "react-router-dom";
import { getBlogCustomRoutes } from "@/config/blogRegistry";
import { PATHS } from "@/config/paths";
import { PUBLIC_ROUTES } from "@/config/routes.config";
import LandingPage from "@/pages/public/LandingPage";

export default function PublicRoutes() {
  const blogRoutes = getBlogCustomRoutes();

  return (
    <Routes>
      <Route element={<LandingPage />}>
        <Route path="/" element={null} />
        <Route path="/login/*" element={null} />
      </Route>
      {blogRoutes.map(({ path, component: Component }) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
      <Route
        path={PATHS.CHANGE_DETAIL}
        element={<Navigate to={PATHS.CHANGES} replace />}
      />
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

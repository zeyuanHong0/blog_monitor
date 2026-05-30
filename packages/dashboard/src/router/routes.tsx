import { Navigate } from "react-router-dom";
import Login from "@/pages/login/index";
import Overview from "@/pages/overview";
import Traffic from "@/pages/traffic";
import Performance from "@/pages/performance";
import Errors from "@/pages/errors";
import ErrorDetail from "@/pages/errors/detail";
import Uptime from "@/pages/uptime";
import NotFound from "@/pages/notFound";
import AuthGuard from "./AuthGuard";

const routes = [
  {
    path: "/",
    element: <Navigate to="/overview" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/overview",
    element: <AuthGuard><Overview /></AuthGuard>,
  },
  {
    path: "/traffic",
    element: <AuthGuard><Traffic /></AuthGuard>,
  },
  {
    path: "/performance",
    element: <AuthGuard><Performance /></AuthGuard>,
  },
  {
    path: "/errors",
    element: <AuthGuard><Errors /></AuthGuard>,
  },
  {
    path: "/errors/:id",
    element: <AuthGuard><ErrorDetail /></AuthGuard>,
  },
  {
    path: "/uptime",
    element: <AuthGuard><Uptime /></AuthGuard>,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;

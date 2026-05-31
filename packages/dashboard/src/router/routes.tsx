import { Navigate } from "react-router-dom";
import Login from "@/pages/login/index";
import Layout from "@/pages/layout/index";
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
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/overview" replace />,
      },
      {
        path: "overview",
        element: <Overview />,
      },
      {
        path: "traffic",
        element: <Traffic />,
      },
      {
        path: "performance",
        element: <Performance />,
      },
      {
        path: "errors",
        element: <Errors />,
      },
      {
        path: "errors/:id",
        element: <ErrorDetail />,
      },
      {
        path: "uptime",
        element: <Uptime />,
      },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;

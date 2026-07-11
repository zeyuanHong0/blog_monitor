/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { Navigate } from "react-router-dom";

import AuthGuard from "./AuthGuard";

const Login = lazy(() => import("@/pages/login/index"));
const Layout = lazy(() => import("@/pages/layout/index"));
const Overview = lazy(() => import("@/pages/overview"));
const Traffic = lazy(() => import("@/pages/traffic"));
const Performance = lazy(() => import("@/pages/performance"));
const Errors = lazy(() => import("@/pages/errors"));
const ErrorDetail = lazy(() => import("@/pages/errors/detail"));
const Uptime = lazy(() => import("@/pages/uptime"));
const NotFound = lazy(() => import("@/pages/notFound"));

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

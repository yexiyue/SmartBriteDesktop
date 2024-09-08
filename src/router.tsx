import { createBrowserRouter, redirect } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Devices } from "./pages/devices";
import { Scenes } from "./pages/scenes";
import { Schedule } from "./pages/schedule";
import { AddDevice } from "./pages/devices/AddDevice";
import { NotFound } from "./pages/NotFound";
import { ErrorBoundary } from "./pages/ErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    ErrorBoundary: ErrorBoundary,
    children: [
      {
        index: true,
        loader: async () => {
          return redirect("/devices");
        },
      },
      {
        path: "/devices",
        element: <Devices />,
      },
      {
        path: "/devices/add",
        element: <AddDevice />,
      },
      {
        path: "/scenes",
        element: <Scenes />,
      },
      {
        path: "/schedule",
        element: <Schedule />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

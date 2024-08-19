import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Devices } from "./pages/devices";
import { Scenes } from "./pages/scenes";
import { Schedule } from "./pages/schedule";
import { AddDevice } from "./pages/devices/AddDevice";
import { DeviceConfig } from "./pages/devices/DeviceConfig";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/devices",
        children: [
          {
            index: true,
            element: <Devices />,
          },
          {
            path: "add",
            children: [
              {
                index: true,
                element: <AddDevice />,
              },
              {
                path: ":id",
                element: <DeviceConfig />,
              },
            ],
          },
        ],
      },
      {
        path: "/scenes",
        element: <Scenes />,
      },
      {
        path: "/schedule",
        element: <Schedule />,
      },
    ],
  },
]);

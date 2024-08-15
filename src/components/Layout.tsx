import { Divider } from "@nextui-org/divider";
import { NextUIProvider } from "@nextui-org/system";
import { useAsyncEffect } from "ahooks";
import { Outlet } from "react-router-dom";
import { init } from "../api";
import { ThemeProvider } from "../hooks/useTheme";
import { Slider } from "./Slider";

export function Layout() {
  useAsyncEffect(async () => {
    try {
      await init();
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <NextUIProvider
      navigate={(path) => {
        console.log(path);
      }}
      locale="zh-CN"
    >
      <ThemeProvider>
        <div className="flex w-full h-full">
          <div className="w-[260px] h-full">
            <Slider />
          </div>
          <Divider orientation="vertical" />
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </ThemeProvider>
    </NextUIProvider>
  );
}

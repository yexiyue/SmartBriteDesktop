import { Divider } from "@nextui-org/divider";
import { NextUIProvider } from "@nextui-org/system";
import { useAsyncEffect } from "ahooks";
import { Outlet } from "react-router-dom";
import { init } from "../api";
import { ThemeProvider, useTheme } from "../hooks/useTheme";
import { Slider } from "./Slider";
import { App, ConfigProvider, theme as AntdTheme } from "antd";
import { useUpdater } from "../hooks/useUpdater";
import { useState } from "react";

export function Layout() {
  return (
    <NextUIProvider locale="zh-CN">
      <ThemeProvider>
        <AppLayout />
      </ThemeProvider>
    </NextUIProvider>
  );
}

function AppLayout() {
  const { theme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === "dark"
            ? AntdTheme.darkAlgorithm
            : AntdTheme.defaultAlgorithm,
      }}
    >
      <App>
        <MyApp />
      </App>
    </ConfigProvider>
  );
}

function MyApp() {
  const { message } = App.useApp();
  const [initialized, setInitialized] = useState(false);
  useAsyncEffect(async () => {
    try {
      const res = await init();
      console.log(res);
      setInitialized(true);
    } catch (error) {
      message.error(`初始化失败 ${error}`);
    }
  }, []);

  useUpdater();

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      <div className="w-[260px] h-full">
        <Slider />
      </div>
      <Divider orientation="vertical" />
      <div className="flex-1">
        <Outlet context={{ initialized }} />
      </div>
    </div>
  );
}

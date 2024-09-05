import { UnlistenFn } from "@tauri-apps/api/event";
import { App } from "antd";
import chroma from "chroma-js";
import { useEffect, useState } from "react";
import {
  connectDevice,
  control,
  disconnectDevice,
  getScene,
  getState,
  getTimeTasks,
  onLedScene,
  onLedState,
  onLedTimeTasks,
  setScene,
  setTimer,
} from "../api";
import { Device, Scene, TimerTask } from "../api/interface";
import { TimeTask } from "../stores/useTimeTaskStore";

export const useLedControl = (device?: string | Device) => {
  const { message } = App.useApp();
  const [ledState, setLedState] = useState<"opened" | "closed">("closed");
  const [isCollected, setIsCollected] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [ledScene, setLedScene] = useState<Scene>();
  const [ledDevice, setLedDevice] = useState<Device>();
  const [timeTasks, setTimeTasks] = useState<TimeTask[]>([]);

  function connectLed(id: string, name?: string) {
    setLedScene(undefined);
    setIsCollecting(true);
    connectDevice(id)
      .then(async (data) => {
        setLedDevice(data);
        setIsCollected(true);
        const scene = await getScene(id);
        const state = await getState(id);
        const time_tasks = await getTimeTasks(id);

        setTimeTasks(time_tasks);
        setLedState(state);
        setLedScene(scene);
      })
      .catch(() => {
        message.error(`连接设备 (${name || id}) 失败`);
      })
      .finally(() => {
        setIsCollecting(false);
      });
  }

  const reConnect = () => {
    if (!device) return;
    setIsCollecting(true);
    if (typeof device === "string") {
      connectLed(device);
    } else {
      connectLed(device.id, device.local_name);
    }
  };

  useEffect(() => {
    let unListenState: Promise<UnlistenFn>;
    let unListenScene: Promise<UnlistenFn>;
    let unListenTimeTask: Promise<UnlistenFn>;
    setIsCollecting(true);
    if (typeof device === "string") {
      unListenState = onLedState(device, (event) => {
        setLedState(event.payload);
      });
      unListenScene = onLedScene(device, (event) => {
        setLedScene(event.payload);
      });
      unListenTimeTask = onLedTimeTasks(device, (event) => {
        setTimeTasks(event.payload);
      });
      connectLed(device);
    } else if (device) {
      unListenState = onLedState(device.id, (event) => {
        setLedState(event.payload);
      });
      unListenScene = onLedScene(device.id, (event) => {
        setLedScene(event.payload);
      });
      unListenTimeTask = onLedTimeTasks(device.id, (event) => {
        setTimeTasks(event.payload);
      });

      connectLed(device.id, device.local_name);
    } else {
      setIsCollected(false);
      setIsCollecting(false);
      setLedState("closed");
      setLedScene(undefined);
      setLedDevice(undefined);
      setTimeTasks([]);
    }

    return () => {
      if (unListenState) {
        unListenState.then((res) => {
          res();
        });
      }
      if (unListenScene) {
        unListenScene.then((res) => {
          res();
        });
      }
      if (unListenTimeTask) {
        unListenTimeTask.then((res) => {
          res();
        });
      }
    };
  }, [device]);

  const open = async () => {
    if (!ledDevice) {
      return message.error(`设备未连接`);
    }
    try {
      await control(ledDevice.id, "open");
      message.success(
        `设备 (${ledDevice.local_name || ledDevice.id}) 开灯成功`
      );
    } catch (error) {
      message.error(`设备 (${ledDevice.local_name || ledDevice.id}) 开灯失败`);
    }
  };
  const close = async () => {
    if (!ledDevice) {
      return message.error(`设备未连接`);
    }
    try {
      await control(ledDevice.id, "close");
      message.success(
        `设备 (${ledDevice.local_name || ledDevice.id}) 关灯成功`
      );
    } catch (error) {
      message.error(`设备 (${ledDevice.local_name || ledDevice.id}) 关灯失败`);
    }
  };
  const reset = async () => {
    if (!ledDevice) {
      return message.error(`设备未连接`);
    }
    try {
      await control(ledDevice.id, "reset");
      message.success(
        `设备 (${ledDevice.local_name || ledDevice.id}) 重置成功`
      );
    } catch (error) {
      message.error(`设备 (${ledDevice.local_name || ledDevice.id}) 重置失败`);
    }
  };

  const changeScene = async (scene: Scene) => {
    if (!ledDevice) {
      return message.error(`设备未连接`);
    }
    try {
      const newScene = structuredClone(scene);
      if (newScene) {
        if (newScene.type === "solid") {
          newScene.color = chroma(newScene.color).rgb() as any;
        } else {
          newScene.colors = newScene.colors.map(
            (item) => ({ ...item, color: chroma(item.color).rgb() } as any)
          );
        }
        await setScene(ledDevice.id, newScene);
        message.success(
          `设备 (${ledDevice.local_name || ledDevice.id}) 设置场景成功`
        );
      }
    } catch (error) {
      message.error(
        `设备 (${ledDevice.local_name || ledDevice.id}) 设置场景失败`
      );
    }
  };
  const disconnect = async () => {
    if (!ledDevice) {
      return message.warning(`设备未连接`);
    }
    try {
      await disconnectDevice(ledDevice.id);
      message.success(
        `设备 (${ledDevice.local_name || ledDevice.id}) 断开连接成功`
      );
    } catch (error) {
      message.error(
        `设备 (${ledDevice.local_name || ledDevice.id}) 断开连接失败`
      );
    }
  };

  const addTimeTask = async (timer: TimerTask) => {
    if (!ledDevice) {
      return message.error(`设备未连接`);
    }
    try {
      await setTimer(ledDevice.id, timer);
      message.success(
        `设备 (${ledDevice.local_name || ledDevice.id}) ${
          timer.type === "addTask"
            ? `添加定时任务${timer.data.name}`
            : `取消定时任务${timer.data}`
        }成功`
      );
    } catch (error) {
      message.error(
        `设备 (${ledDevice.local_name || ledDevice.id}) ${
          timer.type === "addTask"
            ? `添加定时任务${timer.data.name}`
            : `取消定时任务${timer.data}`
        }失败`
      );
    }
  };

  return {
    ledState,
    ledScene,
    ledDevice,
    isCollected,
    isCollecting,
    timeTasks,
    open,
    close,
    reset,
    reConnect,
    changeScene,
    disconnect,
    addTimeTask,
  };
};

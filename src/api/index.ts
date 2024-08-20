import { Channel, invoke } from "@tauri-apps/api/core";
import { EventCallback, listen } from "@tauri-apps/api/event";
import { Device, Scene } from "./interface";

export const init = () => {
  return invoke<string>("init");
};

export function startScan(cb?: (data: Device[]) => void) {
  const channel = new Channel<Device[]>();
  channel.onmessage = cb || (() => {});
  return invoke<void>("start_scan", {
    channel,
  });
}

export function stopScan() {
  return invoke<void>("stop_scan");
}

export function getDevices() {
  return invoke<Device[]>("get_devices");
}

export function connectDevice(id: string) {
  return invoke<Device>("connect", {
    id,
  });
}

export function disconnectDevice(id: string) {
  return invoke<void>("disconnect", {
    id,
  });
}

export function control(id: string, command: "open" | "close" | "reset") {
  return invoke<void>("control", {
    id,
    command,
  });
}

export function setScene(id: string, scene: Scene) {
  return invoke<void>("set_scene", {
    id,
    scene,
  });
}

export function getScene(id: string) {
  return invoke<Scene>("get_scene", {
    id,
  });
}

export function getState(id: string) {
  return invoke<"closed" | "opened">("get_state", {
    id,
  });
}

export function onLedState(id: string, cb: EventCallback<"opened" | "closed">) {
  return listen<"opened" | "closed">(`state-${id}`, cb);
}

export function onLedScene(id: string, cb: EventCallback<Scene>) {
  return listen<Scene>(`scene-${id}`, cb);
}

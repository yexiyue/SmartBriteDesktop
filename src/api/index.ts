import { invoke, Channel } from "@tauri-apps/api/core";

export const init = () => {
  return invoke<string>("init");
};

export function startScan(cb: (data: Device[]) => void) {
  const channel = new Channel<Device[]>();
  channel.onmessage = cb;
  return invoke<void>("start_scan", {
    channel,
  });
}

export function stopScan() {
  return invoke<void>("stop_scan");
}

type Device = {
  id: string;
  address: string;
};

export function getDevices() {
  return invoke<Device[]>("get_devices");
}

export function connectDevice(id: string) {
  return invoke<void>("connect_device", {
    id,
  });
}

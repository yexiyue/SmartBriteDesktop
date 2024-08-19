import { Device } from "./../api/interface";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type DeviceState = {
  devices: Device[];
};

type DeviceAction = {
  addDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
};

export const useDeviceStore = create(
  persist(
    immer<DeviceState & DeviceAction>((set) => ({
      devices: [],
      addDevice: (device) => {
        set((state) => {
          if (!state.devices.map((item) => item.id).includes(device.id)) {
            state.devices.push(device);
          }
        });
      },
      removeDevice: (id) => {
        set((state) => {
          state.devices = state.devices.filter((device) => device.id !== id);
        });
      },
    })),
    {
      name: "device",
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Scene } from "../api/interface";

export type ScenesConfig = Scene & {
  description?: string;
  isBuiltin?: boolean;
};

type SceneState = {
  scenes: ScenesConfig[];
};

type SceneActions = {
  addScene: (scene: ScenesConfig) => void;
  removeScene: (name: string) => void;
  updateScene: (name: string, scene: ScenesConfig) => void;
};

export const useScenesStore = create(
  persist(
    immer<SceneState & SceneActions>((set) => ({
      scenes: [],
      addScene: (scene) => {
        set((state) => {
          state.scenes.push(scene);
        });
      },
      removeScene: (name) => {
        set((state) => {
          state.scenes = state.scenes.filter((scene) => scene.name !== name);
        });
      },
      updateScene: (name, scene) => {
        set((state) => {
          const index = state.scenes.findIndex((scene) => scene.name === name);
          if (index !== -1) {
            state.scenes[index] = scene;
          }
        });
      },
    })),
    { name: "scenes" }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type ScenesConfig =
  | {
      name: string;
      color: string;
      type: "solid";
      autoOn: boolean;
      description?: string;
      isBuiltin?: boolean;
    }
  | {
      name: string;
      color: string;
      type: "gradient";
      duration: number;
      autoOn: boolean;
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

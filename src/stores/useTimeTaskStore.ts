import { AddTask } from "./../api/interface";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type TimeTask = AddTask["data"];

type TimeTaskState = {
  timeTasks: TimeTask[];
};

type TimeTaskAction = {
  addTimeTask: (timeTask: TimeTask) => void;
  removeTimeTask: (name: string) => void;
  updateTimeTask: (name: string, timeTask: TimeTask) => void;
};

export const useTimeTaskStore = create(
  persist(
    immer<TimeTaskState & TimeTaskAction>((set) => ({
      timeTasks: [],
      addTimeTask: (timeTask) => {
        set((state) => {
          if (
            !state.timeTasks.map((item) => item.name).includes(timeTask.name)
          ) {
            state.timeTasks.push(timeTask);
          }
        });
      },
      removeTimeTask: (name) => {
        set((state) => {
          state.timeTasks = state.timeTasks.filter(
            (timeTask) => timeTask.name !== name
          );
        });
      },
      updateTimeTask: (name, timeTask) => {
        set((state) => {
          const index = state.timeTasks.findIndex(
            (timeTask) => timeTask.name === name
          );
          if (index !== -1) {
            state.timeTasks[index] = timeTask;
          }
        });
      },
    })),
    {
      name: "timeTask",
    }
  )
);

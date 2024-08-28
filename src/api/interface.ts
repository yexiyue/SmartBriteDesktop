export type Scene = {
  name: string;
  autoOn: boolean;
} & (
  | { type: "solid"; color: string }
  | {
      type: "gradient";
      colors: ColorDuration[];
      linear: boolean;
    }
);

export type ColorDuration = {
  color: string;
  duration: number;
};

export type Device = {
  id: string;
  address: string;
  local_name: string;
};

export type RemoveTask = {
  type: "removeTask";
  data: string;
};

export type AddTask = {
  type: "addTask";
  data: {
    name: string;
    operation: "open" | "close" | "reset";
  } & (
    | {
        kind: "once";
        endTime: string;
      }
    | {
        kind: "day";
        delay: string;
      }
    | {
        kind: "week";
        dayOfWeek: number;
        delay: string;
      }
  );
};

export type TimerTask = RemoveTask | AddTask;

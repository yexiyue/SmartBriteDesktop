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

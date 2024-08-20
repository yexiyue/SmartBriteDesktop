import { useControllableValue } from "ahooks";
import { useScenesStore } from "../../stores/useScenesStore";
import { Select, SelectItem } from "@nextui-org/select";

type SceneSelectProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export const SceneSelect = (props: SceneSelectProps) => {
  const [scenes] = useScenesStore((store) => [store.scenes]);
  const [value, setValue] = useControllableValue(props);

  return (
    <Select
      selectedKeys={[value]}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      aria-label="scene-select"
      placeholder="请选择场景"
      labelPlacement="outside-left"
      className="max-w-sm text-nowrap items-center gap-4 text-small"
      renderValue={(items) => {
        return items.map(({ key }) => {
          const item = scenes.find((item) => item.name === key)!;
          let color = "";
          if (item.type === "solid") {
            color = item.color;
          } else {
            const colors = item.colors.map((item) => item.color);
            color = `linear-gradient(60deg, ${colors.join(", ")})`;
          }

          return (
            <div className="flex gap-2 items-center">
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  background: color,
                }}
              ></div>
              <div className="flex flex-col">
                <span className="text-small text-default-800">{item.name}</span>
                <span className="text-tiny text-default-400">
                  {item.type === "solid"
                    ? "单色"
                    : `渐变 (${item.linear ? "线性" : "闪烁"})`}
                  <span className="ml-2">{item.description}</span>
                </span>
              </div>
            </div>
          );
        });
      }}
    >
      {scenes.map((item) => {
        let color = "";
        if (item.type === "solid") {
          color = item.color;
        } else {
          const colors = item.colors.map((item) => item.color);
          color = `linear-gradient(60deg, ${colors.join(", ")})`;
        }
        return (
          <SelectItem key={item.name} textValue={item.name}>
            <div className="flex gap-2 items-center">
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  background: color,
                }}
              ></div>
              <div className="flex flex-col">
                <span className="text-small text-default-800">{item.name}</span>
                <span className="text-tiny text-default-400">
                  {item.type === "solid"
                    ? "单色"
                    : `渐变 (${item.linear ? "线性" : "闪烁"})`}
                  <span className="ml-2">{item.description}</span>
                </span>
              </div>
            </div>
          </SelectItem>
        );
      })}
    </Select>
  );
};

import { Chip } from "@nextui-org/chip";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { useControllableValue } from "ahooks";
import { HexColorPicker } from "react-colorful";

const presetColors = [
  "#F5222D",
  "#FA8C16",
  "#FADB14",
  "#8BBB11",
  "#52C41A",
  "#13A8A8",
  "#1677FF",
  "#2F54EB",
  "#722ED1",
  "#EB2F96",
  "#ffffff",
  "#000000",
];
export const ColorPopover = (props: {
  value?: string;
  onChange?: (value: string) => void;
  onClose?: (value: string) => void;
}) => {
  const [value, setValue] = useControllableValue(props);

  return (
    <Popover placement="top" showArrow>
      <PopoverTrigger>
        <Chip
          className="border rounded cursor-pointer h-8 "
          variant="bordered"
          startContent={
            <div
              className="w-6 h-6 cursor-pointer rounded"
              style={{
                backgroundColor: value,
              }}
            ></div>
          }
          onClose={
            props.onClose
              ? () => {
                  props.onClose!(value);
                }
              : undefined
          }
        >
          <p className="text-small text-foreground-600 w-[54px]">
            {String(value).toUpperCase()}
          </p>
        </Chip>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-[238px] flex gap-4 flex-col items-center justify-center">
        <HexColorPicker color={value} onChange={setValue} />
        <div className="flex flex-wrap w-[200px] gap-2 justify-between">
          {presetColors.map((color) => (
            <div
              key={color}
              className="w-6 h-6 cursor-pointer rounded-full border"
              style={{
                backgroundColor: color,
              }}
              onClick={() => {
                setValue(color);
              }}
            ></div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

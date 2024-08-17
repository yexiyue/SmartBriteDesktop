import { useControllableValue } from "ahooks";
import { ColorDuration } from "../../api/interface";
import { ColorPopover } from "./ColorPopover";
import chroma from "chroma-js";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { HourglassIcon, TrashIcon } from "lucide-react";
import { ScrollShadow } from "@nextui-org/scroll-shadow";

export const Colors = (props: {
  value?: ColorDuration[];
  onChange?: (value: ColorDuration[]) => void;
}) => {
  const [value, setValue] = useControllableValue<ColorDuration[]>(props);

  return (
    <div className="flex flex-col gap-2">
      <ScrollShadow className="flex flex-col gap-2 max-h-[140px]" hideScrollBar>
        {value?.map((item, index) => (
          <div
            key={index}
            className="flex gap-2 justify-between items-center text-default-500"
          >
            <ColorPopover
              value={item.color}
              onChange={(v) => {
                setValue(
                  value.map((item, i) => {
                    if (index === i) {
                      return {
                        duration: item.duration,
                        color: v,
                      };
                    }
                    return item;
                  })
                );
              }}
            />

            <Input
              type="number"
              min={0}
              size="sm"
              value={String(item.duration)}
              defaultValue={"2"}
              onValueChange={(v) => {
                setValue(
                  value.map((item, i) => {
                    if (index === i) {
                      return {
                        color: item.color,
                        duration: Number(v),
                      };
                    }
                    return item;
                  })
                );
              }}
              endContent={<HourglassIcon className="w-4 h-4" />}
            />

            <Button
              size="sm"
              isIconOnly
              isDisabled={value.length <= 2}
              onClick={() => {
                setValue(
                  value.filter((_, i) => {
                    return index !== i;
                  })
                );
              }}
              variant="light"
              color="danger"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </ScrollShadow>

      <Button
        size="sm"
        color="primary"
        variant="flat"
        onClick={() => {
          setValue([
            ...value,
            {
              color: chroma.random().hex("rgb"),
              duration: 2,
            },
          ]);
        }}
      >
        添加渐变颜色
      </Button>
    </div>
  );
};

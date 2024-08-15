import { Button } from "@nextui-org/button";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { useControllableValue } from "ahooks";
import { PropsWithChildren, useEffect } from "react";
import ColorPicker, {
  ColorPickerProps,
  useColorPicker,
} from "react-best-gradient-color-picker";
import styles from "./index.module.less";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { semanticColors } from "@nextui-org/theme";
export const ColorPopover = (
  props: Pick<ColorPickerProps, "value" | "onChange"> &
    PropsWithChildren & {
      type?: "solid" | "gradient";
      onTypeChange?: (type: "solid" | "gradient") => void;
    }
) => {
  const { type = "solid" } = props;
  const [value, setValue] = useControllableValue(props);
  const { setSolid, setGradient, isGradient } = useColorPicker(value, setValue);

  useEffect(() => {
    if (type === "solid") {
      setSolid(semanticColors.light.primary[500]!);
    } else {
      setGradient(
        "linear-gradient(90deg, rgb(233,46,65) 0%, rgb(122,255,66) 100%)"
      );
    }
  }, [type]);

  useEffect(() => {
    props.onTypeChange?.(isGradient ? "gradient" : "solid");
  }, [isGradient]);

  return (
    <Popover placement="top" showArrow>
      <PopoverTrigger>
        <Button color="primary">设置颜色</Button>
      </PopoverTrigger>
      <PopoverContent>
        <ScrollShadow
          className="p-4 max-h-[420px] overflow-y-auto"
          hideScrollBar
        >
          <ColorPicker
            value={value}
            className={styles.colorPicker}
            onChange={setValue}
            width={256}
            height={200}
            hidePresets
            hideOpacity
            hideGradientAngle
            hideGradientType
          />
        </ScrollShadow>
      </PopoverContent>
    </Popover>
  );
};

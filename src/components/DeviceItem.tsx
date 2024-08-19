import { Chip } from "@nextui-org/chip";
import { Skeleton } from "@nextui-org/skeleton";
import { Spinner } from "@nextui-org/spinner";
import { Switch } from "@nextui-org/switch";
import { cn } from "@nextui-org/theme";
import { App } from "antd";
import chroma from "chroma-js";
import { Lightbulb, LightbulbOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { connect, control, getScene, onLedState } from "../api";
import { Device, Scene } from "../api/interface";

type DeviceItemProps = {
  data: Device;
  onClick?: (data: Device) => void;
};

export const DeviceItem = ({ data }: DeviceItemProps) => {
  const [ledState, setLedState] = useState<"opened" | "closed">("closed");
  const [scene, setScene] = useState<Scene>();
  const { message } = App.useApp();
  const [isCollected, setIsCollected] = useState(false);
  const [collecting, setCollecting] = useState(false);

  useEffect(() => {
    const unListen = onLedState(data.id, (event) => {
      setLedState(event.payload);
    });
    setCollecting(true);
    connect(data.id)
      .then(() => {
        setIsCollected(true);
        return getScene(data.id);
      })
      .then((scene) => {
        setScene(scene);
      })
      .catch(() => {
        message.error(`连接设备 (${data.local_name || data.id}) 失败`);
      })
      .finally(() => {
        setCollecting(false);
      });

    return () => {
      unListen.then((res) => res());
    };
  }, [data]);

  const color = useMemo(() => {
    if (scene) {
      if (scene.type === "solid") {
        return chroma(scene.color).css();
      } else {
        const colors = scene.colors.map((item) => chroma(item.color).css());
        return `linear-gradient(60deg, ${colors.join(", ")})`;
      }
    }
  }, [scene]);

  return (
    <Switch
      isSelected={ledState === "opened"}
      classNames={{
        base: cn(
          "inline-flex flex-row-reverse w-full max-w-sm bg-content1 hover:bg-content2 items-center shadow-small",
          "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
          "data-[selected=true]:border-primary"
        ),
        wrapper: "p-0 h-4 overflow-visible",
        thumb: cn(
          "w-6 h-6 border-2 shadow-lg",
          "group-data-[hover=true]:border-primary",
          //selected
          "group-data-[selected=true]:ml-6",
          // pressed
          "group-data-[pressed=true]:w-7",
          "group-data-[selected]:group-data-[pressed]:ml-4"
        ),
      }}
      thumbIcon={({ isSelected, className }) => {
        if (isSelected) {
          return <Lightbulb className={cn(className, "w-3 h-3")} />;
        } else {
          return <LightbulbOff className={cn(className, "w-3 h-3")} />;
        }
      }}
      onValueChange={async (value) => {
        if (value) {
          await control(data.id, "open");
        } else {
          await control(data.id, "close");
        }
      }}
      isDisabled={!isCollected}
    >
      <div className="flex flex-col gap-1">
        <Chip
          color={isCollected ? "success" : "danger"}
          variant="dot"
          startContent={collecting && <Spinner color="warning" size="sm" />}
          className="rounded-small border"
        >
          {data?.local_name || "未知"}
        </Chip>
        <p className="text-tiny text-default-400">{data?.id}</p>

        {scene ? (
          <div className="flex gap-2 items-center">
            <div
              className="w-6 h-6 rounded-full"
              style={{
                background: color,
              }}
            ></div>
            <div className="flex flex-col">
              <span className="text-tiny text-default-500">{scene?.name}</span>
              <span className="text-tiny text-default-400">
                {scene?.type === "solid"
                  ? "单色"
                  : `渐变 (${scene?.linear ? "线性" : "闪烁"})`}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <Skeleton className="rounded-full w-6 h-6 flex-shrink-0" />
            <div className="flex flex-col gap-2">
              <Skeleton className="rounded w-[60px] h-3" />
              <Skeleton className="rounded w-[100px] h-3" />
            </div>
          </div>
        )}
      </div>
    </Switch>
  );
};

import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Spinner } from "@nextui-org/spinner";
import { Switch } from "@nextui-org/switch";
import { cn } from "@nextui-org/theme";
import { App } from "antd";
import { Lightbulb, LightbulbOff, RotateCcwIcon } from "lucide-react";
import { Device } from "../../api/interface";
import { useLedControl } from "../../hooks/useLedControl";
import { useDeviceStore } from "../../stores/useDeviceStore";
import { useScenesStore } from "../../stores/useScenesStore";
import { SceneItem } from "../scenes/SceneItem";

type DeviceItemProps = {
  data: Device;
  disable?: boolean;
};

export const DeviceItem = ({ data, disable }: DeviceItemProps) => {
  const [scenes] = useScenesStore((store) => [store.scenes]);
  const { message } = App.useApp();
  const {
    open,
    close,
    changeScene,
    reset,
    ledState,
    isCollected,
    isCollecting,
    ledScene,
    reConnect,
  } = useLedControl(disable ? undefined : data);
  const [removeDevice] = useDeviceStore((store) => [store.removeDevice]);

  return (
    <Dropdown isDisabled={disable}>
      <DropdownTrigger>
        <div className="flex  w-full bg-content1 shadow-medium p-4 gap-2 rounded-lg max-w-sm justify-between cursor-pointer hover:bg-content2 ">
          <div className="flex flex-col gap-1">
            <Chip
              color={isCollected ? "success" : "danger"}
              variant="dot"
              startContent={
                isCollecting && <Spinner color="warning" size="sm" />
              }
              className="rounded-small border"
            >
              {data?.local_name || "未知"}
            </Chip>
            <p className="text-tiny text-default-400">{data?.id}</p>

            <SceneItem scene={ledScene} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              onClick={reConnect}
              color="primary"
              variant="ghost"
              className="border border-default"
            >
              <RotateCcwIcon className="w-4 h-4" />
            </Button>
            <Switch
              size="sm"
              isSelected={ledState === "opened"}
              thumbIcon={({ isSelected, className }) => {
                if (isSelected) {
                  return <Lightbulb className={cn(className, "w-3 h-3")} />;
                } else {
                  return <LightbulbOff className={cn(className, "w-3 h-3")} />;
                }
              }}
              onValueChange={(value) => {
                if (value) {
                  open();
                } else {
                  close();
                }
              }}
              isDisabled={!isCollected}
            ></Switch>
          </div>
        </div>
      </DropdownTrigger>
      <DropdownMenu aria-label="device-dropdown">
        <DropdownSection title="切换场景">
          {scenes.map((scene) => (
            <DropdownItem
              key={scene.name}
              onClick={async () => {
                await changeScene(scene);
                await open();
              }}
            >
              <SceneItem scene={scene} />
            </DropdownItem>
          ))}
        </DropdownSection>
        <DropdownSection title="危险操作">
          <DropdownItem
            key="delete"
            className="text-danger"
            color="danger"
            onClick={() => {
              removeDevice(data.id);
              message.success(`删除设备 (${data.id}) 成功`);
            }}
          >
            删除设备
          </DropdownItem>
          <DropdownItem
            key="reset"
            className="text-danger"
            color="danger"
            onClick={() => {
              reset();
            }}
          >
            重置设备
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};

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
import { readValue, writeValue } from "../../api";

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
          <DropdownItem
            key="write_value"
            className="text-danger"
            color="danger"
            onClick={async () => {
              try {
                await writeValue(data.id, {
                  version: "0.1.1",
                  notes: "See the assets to download and install this version.",
                  pub_date: "2024-08-20T13:06:10.101Z",
                  platforms: {
                    "darwin-x86_64": {
                      signature:
                        "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUcEs5S1ZCSHpheVo3cGd5N1lsVm9sVmRTRFlGRHVlUXFBRm5uaVY0YzV5enBZTGFpcTlGTkNwN0NYNXg2NnBSK1A0ckp5cUhrSVhaSndBSC9WWU1kbktKeUhQWUZ1WEFRPQp0cnVzdGVkIGNvbW1lbnQ6IHRpbWVzdGFtcDoxNzI0MTU4ODY1CWZpbGU6c21hcnQtYnJpdGUuYXBwLnRhci5negp3anM1SDI2VXhiM0g1MVRHTzJpODladnpoOFNuek9iT2NBVjNwTExET0dpdXhJV2V0ZEFSWXl2dURMOWl3dm93YThXeFIvckh2VVM1MStFbnFlZCtCQT09Cg==",
                      url: "https://github.com/yexiyue/SmartBriteDesktop/releases/download/v0.1.1/smart-brite_x64.app.tar.gz",
                    },
                    "darwin-aarch64": {
                      signature:
                        "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUcEs5S1ZCSHpheVVtTXpnYUFKNS9NQzVFRTROQkszOGJhSk4zRmxvVU92ZHJ0UGU3bFdSNXYzRDFpYm5qaFdZbjZyRm4xNGFGaFdzTFAzL1hVekNTM0dCWHlZS09QS1FrPQp0cnVzdGVkIGNvbW1lbnQ6IHRpbWVzdGFtcDoxNzI0MTU4ODkyCWZpbGU6c21hcnQtYnJpdGUuYXBwLnRhci5negpnNEFhTC9FRHNMbnBsVmhIQXFsZW9UOUw4cDlRODF1a2o5OUFWV29PMjVaUjlkSERPOFQzTEtRVnpNS1pRL3NuQUVKRGtMRnRYczBwU2k2NXpkY3dDUT09Cg==",
                      url: "https://github.com/yexiyue/SmartBriteDesktop/releases/download/v0.1.1/smart-brite_aarch64.app.tar.gz",
                    },
                    "linux-x86_64": {
                      signature:
                        "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUcEs5S1ZCSHpheVNUSWNENWxxUDlLVjFybHR0V3VpSmlzd3VlajVINEpxenNkSWxNQWdVRExRTkRacGNUUFFuWTdVejk1Y0ZvcjFXd0Q1YWg4aGpHOFJ0UXFGYk9zV3dNPQp0cnVzdGVkIGNvbW1lbnQ6IHRpbWVzdGFtcDoxNzI0MTU5MTAxCWZpbGU6c21hcnQtYnJpdGVfMC4xLjFfYW1kNjQuQXBwSW1hZ2UKaHdKSjZjWWdjVUUxNTdoSjNITEoycFFDUlBVaE5aYzk3TFRMT24zQThHVmxXNEE0N21QS0dJUHpmSytuYXR0WFhDaXBxZVc0RXR1YXppRzhLY1JhQ1E9PQo=",
                      url: "https://github.com/yexiyue/SmartBriteDesktop/releases/download/v0.1.1/smart-brite_0.1.1_amd64.AppImage",
                    },
                    "windows-x86_64": {
                      signature:
                        "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUcEs5S1ZCSHpheVhTVTNWN3BJeVRUaUZLQmZ3RVhlSHk0QWlFMzhqUTF2bFhReFZET2NzVElNUWFxcjRIemc0elk4Q0EwNDE2ejA5MEZtUC9WbWQzMlVqc1ZTWWdSbncwPQp0cnVzdGVkIGNvbW1lbnQ6IHRpbWVzdGFtcDoxNzI0MTU5MTY3CWZpbGU6c21hcnQtYnJpdGVfMC4xLjFfeDY0X2VuLVVTLm1zaQovY2RKMTlud3ozTTlScUV6UlF4MTc5WGlHU051M0h5YjRjVzV1THVHWHBWdEpsYzhMSGs2M3BDSFR0WEFhVVhvclBLRW4wK09WLys0R0h0Q2thUjhBUT09Cg==",
                      url: "https://github.com/yexiyue/SmartBriteDesktop/releases/download/v0.1.1/smart-brite_0.1.1_x64_en-US.msi",
                    },
                  },
                });
                console.log("write success");
              } catch (e) {
                console.error(e);
              }
            }}
          >
            写入数据
          </DropdownItem>
          <DropdownItem
            key="read_value"
            className="text-danger"
            color="danger"
            onClick={async () => {
              try {
                let value = await readValue(data.id);
                console.log("read success ", value);
              } catch (e) {
                console.error(e);
              }
            }}
          >
            读取数据
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};

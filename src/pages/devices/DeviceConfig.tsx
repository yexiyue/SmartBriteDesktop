import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Code } from "@nextui-org/code";
import { Divider } from "@nextui-org/divider";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Spinner } from "@nextui-org/spinner";
import { Switch } from "@nextui-org/switch";
import { Tooltip } from "@nextui-org/tooltip";
import chroma from "chroma-js";
import { Lightbulb, LightbulbOff, RefreshCcw, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  connect,
  control,
  disconnect,
  getScene,
  onLedState,
  setScene,
  startScan,
} from "../../api";
import { Device, Scene } from "../../api/interface";
import { SceneSelect } from "../../components/SceneSelect";
import CreateScenes, { CreateScenesRef } from "../../components/createScenes";
import { useDeviceStore } from "../../stores/useDeviceStore";
import { useScenesStore } from "../../stores/useScenesStore";

export const DeviceConfig = () => {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [ledState, setLedState] = useState<"opened" | "closed">("closed");
  const [connecting, setConnecting] = useState(false);
  const [device, setDevice] = useState<Device>();
  const [sceneConfig, setSceneConfig] = useState<Scene>();
  const createScenesRef = useRef<CreateScenesRef>(null);
  const [scenes, addScene] = useScenesStore((store) => [
    store.scenes,
    store.addScene,
  ]);
  const [addDevice] = useDeviceStore((store) => [store.addDevice]);

  useEffect(() => {
    setConnecting(true);
    const unListen = onLedState(id, (data) => {
      setLedState(data.payload);
    });
    connect(id)
      .then(async (res) => {
        setDevice(res);
        const scene = await getScene(id);
        setSceneConfig(scene);
        if (!scenes.some((item) => item.name === scene.name)) {
          if (scene.type === "solid") {
            scene.color = chroma(scene.color).hex("rgb");
          } else {
            scene.colors = scene.colors.map((item) => ({
              ...item,
              color: chroma(item.color).hex("rgb"),
            }));
          }
          createScenesRef.current?.edit(scene);
        }
      })
      .finally(() => {
        setConnecting(false);
      });

    return () => {
      disconnect(id);
      unListen.then((res) => {
        res();
      });
    };
  }, [id]);

  return (
    <div className="w-full h-full relative flex flex-col">
      <div className="p-4 pb-0 flex justify-between items-center">
        <Breadcrumbs variant="solid">
          <BreadcrumbItem
            startContent={<Smartphone className="w-4 h-4" />}
            onClick={() => {
              navigate("/devices");
            }}
          >
            设备
          </BreadcrumbItem>
          <BreadcrumbItem
            onClick={() => {
              navigate("/devices/add");
            }}
          >
            添加
          </BreadcrumbItem>
          <BreadcrumbItem>{id}</BreadcrumbItem>
        </Breadcrumbs>
        <Tooltip placement="left" color="primary" content={<p>刷新</p>}>
          <Button
            onClick={async () => {
              try {
                startScan();
                setConnecting(true);
                const device = await connect(id);
                setDevice(device);
              } catch (error) {
                console.log(error);
              } finally {
                setConnecting(false);
              }
            }}
            color="primary"
            size="sm"
            isIconOnly
            radius="full"
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
      <ScrollShadow className="flex-1 p-4 relative" hideScrollBar>
        {connecting ? (
          <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
            <Spinner
              classNames={{
                label: "text-small",
              }}
              label="连接设备中..."
              color="warning"
            />
          </div>
        ) : (
          <Card className="w-full h-full">
            <CardHeader className="flex justify-between items-center pb-0">
              <p className=" text-default-600">
                {device?.local_name || "未知"}
              </p>
              <Switch
                isSelected={ledState === "opened"}
                onValueChange={(value) => {
                  if (value) {
                    control(id, "open");
                  } else {
                    control(id, "close");
                  }
                }}
                startContent={<Lightbulb className="w-4 h-4" />}
                endContent={<LightbulbOff className="w-4 h-4" />}
              />
            </CardHeader>
            <CardBody className=" gap-4 w-full overflow-hidden">
              <Code color="warning">设备ID: {device?.id}</Code>
              <Divider />
              <SceneSelect
                value={sceneConfig?.name}
                onChange={(name) => {
                  setSceneConfig(scenes.find((item) => item.name === name));
                }}
              />
              <Button
                onClick={async () => {
                  const newScene = structuredClone(sceneConfig);
                  if (newScene) {
                    if (newScene.type === "solid") {
                      newScene.color = chroma(newScene.color).rgb() as any;
                    } else {
                      newScene.colors = newScene.colors.map(
                        (item) =>
                          ({ ...item, color: chroma(item.color).rgb() } as any)
                      );
                    }
                    await setScene(id, newScene);
                  }
                }}
                color="primary"
                size="sm"
              >
                设置场景
              </Button>
            </CardBody>
            <CardFooter className=" gap-4 justify-end">
              <Button
                onClick={() => {
                  navigate("/devices/add");
                }}
                variant="light"
                size="sm"
              >
                返回
              </Button>

              <Button
                onClick={() => {
                  if (device) {
                    addDevice(device);
                  }
                  navigate("/devices");
                }}
                color="primary"
                size="sm"
              >
                保存设备
              </Button>
            </CardFooter>
          </Card>
        )}
      </ScrollShadow>
      <CreateScenes
        ref={createScenesRef}
        onEdit={(_, config) => {
          addScene(config);
        }}
      />
    </div>
  );
};

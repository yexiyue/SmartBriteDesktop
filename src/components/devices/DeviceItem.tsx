import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import { Code } from "@nextui-org/code";
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
import { useMemoizedFn } from "ahooks";
import { App } from "antd";
import dayjs from "dayjs";
import { Lightbulb, LightbulbOff, RotateCcwIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Device } from "../../api/interface";
import { useLedControl } from "../../hooks/useLedControl";
import { useDeviceStore } from "../../stores/useDeviceStore";
import { useScenesStore } from "../../stores/useScenesStore";
import { SceneItem } from "../scenes/SceneItem";
import { getTime, MiniTimeTask } from "../schedule/MiniTimeTask";
import { AddTimeTaskModal, AddTimeTaskModalRef } from "./AddTimeTaskModal";

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
    timeTasks,
    addTimeTask,
  } = useLedControl(disable ? undefined : data);
  const [removeDevice] = useDeviceStore((store) => [store.removeDevice]);
  const addTimeTaskRef = useRef<AddTimeTaskModalRef>(null);

  const calcTimeDelayAndTask = useMemoizedFn(() => {
    return timeTasks
      .filter((item) => {
        if (item.kind === "once") {
          if (dayjs(item.endTime).diff(dayjs()) < 0) {
            return false;
          }
        }
        return true;
      })
      .map((item) => [getTime(item), item] as const)
      .sort(([a], [b]) => {
        if (a.days > b.days) {
          return 1;
        }
        if (a.hours > b.hours) {
          return 1;
        }
        if (a.minutes > b.minutes) {
          return 1;
        }
        return -1;
      })
      .at(0);
  });
  const [timeDelayAndTask, setTimeDelayAndTask] = useState(
    calcTimeDelayAndTask()
  );
  useEffect(() => {
    setTimeDelayAndTask(calcTimeDelayAndTask());
  }, [timeTasks]);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeDelayAndTask(calcTimeDelayAndTask());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <>
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
              {timeDelayAndTask && (
                <Code color="success">
                  将在{timeDelayAndTask[0].days}天，{timeDelayAndTask[0].hours}
                  小时，
                  {timeDelayAndTask[0].minutes}分钟后
                  {timeDelayAndTask[1].operation === "open" ? "开灯" : "关灯"}
                </Code>
              )}
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
                    return (
                      <LightbulbOff className={cn(className, "w-3 h-3")} />
                    );
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
          <DropdownSection title="定时任务">
            {timeTasks?.map((task) => (
              <DropdownItem
                key={task?.name}
                onClick={() => {
                  addTimeTask({
                    type: "removeTask",
                    data: task.name,
                  });
                }}
              >
                <MiniTimeTask timeTask={task} />
              </DropdownItem>
            ))}
          </DropdownSection>
          <DropdownItem
            key="addTimeTask"
            color="primary"
            onClick={() => {
              addTimeTaskRef.current?.open();
            }}
          >
            添加定时任务
          </DropdownItem>
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
      <AddTimeTaskModal
        ref={addTimeTaskRef}
        onCreate={(config) => {
          addTimeTask({
            type: "addTask",
            data: config,
          });
        }}
      />
    </>
  );
};

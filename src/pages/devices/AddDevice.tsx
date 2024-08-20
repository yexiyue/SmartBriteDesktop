import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { Card, CardBody } from "@nextui-org/card";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import {
  BluetoothSearching,
  LightbulbIcon,
  RefreshCcw,
  Smartphone,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDevices, startScan, stopScan } from "../../api";
import { Device } from "../../api/interface";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/tooltip";
import { App } from "antd";
import {
  AddDeviceModal,
  AddDeviceModalRef,
} from "../../components/devices/AddDeviceModal";
import { useDeviceStore } from "../../stores/useDeviceStore";
import { Chip } from "@nextui-org/chip";
import { cn } from "@nextui-org/theme";

export const AddDevice = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Device[]>([]);
  const { message } = App.useApp();
  const addDeviceModalRef = useRef<AddDeviceModalRef>(null);
  const [devices] = useDeviceStore((store) => [store.devices]);
  const [refreshing, setRefreshing] = useState(false);
  const ids = useMemo(() => {
    return new Set(devices.map((item) => item.id));
  }, [devices]);

  useEffect(() => {
    setRefreshing(true);
    startScan((data) => {
      setData(data);
      setRefreshing(false);
    })
      .then(async () => {
        setData(await getDevices());
      })
      .catch((err) => {
        message.error(err.message);
      })
      .finally(() => {
        setRefreshing(false);
      });

    return () => {
      stopScan();
    };
  }, []);

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
          <BreadcrumbItem>添加</BreadcrumbItem>
        </Breadcrumbs>

        <Tooltip placement="bottom" color="primary" content={<p>刷新</p>}>
          <Button
            onClick={async () => {
              setRefreshing(true);
              setData(await getDevices());
              setRefreshing(false);
            }}
            color="primary"
            size="sm"
            isIconOnly
            radius="full"
          >
            <RefreshCcw
              className={cn("w-4 h-4", refreshing && "animate-spin")}
            />
          </Button>
        </Tooltip>
      </div>
      <ScrollShadow className="flex-1 p-4" hideScrollBar>
        <div className="flex justify-center items-center flex-col gap-4">
          <div
            onClick={async () => {
              setData(await getDevices());
            }}
            className="flex justify-center items-center h-[100px] w-[100px] rounded-full bg-content2 cursor-pointer hover:opacity-hover"
          >
            <div className="flex justify-center items-center h-[88px] w-[88px] rounded-full bg-content3 ">
              <div className="flex justify-center items-center h-[70px] w-[70px] rounded-full bg-content4">
                <BluetoothSearching className="w-10 h-10 text-primary-500" />
              </div>
            </div>
          </div>
          <p className=" text-small text-default-500 select-none cursor-default">
            搜索附近LED 设备
          </p>
        </div>
        <div className="flex gap-4 flex-wrap w-full justify-evenly p-4">
          {data.map((item) => {
            return (
              <Card
                key={item.id}
                className={cn(
                  "max-w-sm dark:bg-content2 cursor-default",
                  !ids.has(item.id) &&
                    "hover:bg-content2 dark:hover:bg-content3 cursor-pointer"
                )}
                isPressable={!ids.has(item.id)}
                onPress={() => {
                  addDeviceModalRef.current?.open(item);
                }}
              >
                <CardBody className="text-small text-default-600 gap-3 flex-row items-center">
                  <div className="w-10 h-10 rounded-full flex justify-center items-center bg-primary-400 flex-shrink-0 text-content1">
                    <LightbulbIcon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-medium">
                      {item.local_name || "未知"}
                      <Chip
                        className="rounded border ml-4 border-default-300 "
                        color={ids.has(item.id) ? "success" : "warning"}
                        size="sm"
                        variant="bordered"
                      >
                        <span>{ids.has(item.id) ? "已添加" : "未添加"}</span>
                      </Chip>
                    </div>
                    <p className="text-default-500 text-nowrap">{item.id}</p>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </ScrollShadow>
      <AddDeviceModal ref={addDeviceModalRef} />
    </div>
  );
};

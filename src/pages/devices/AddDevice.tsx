import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { Card, CardBody } from "@nextui-org/card";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import {
  BluetoothSearching,
  LightbulbIcon,
  RefreshCcw,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDevices, startScan, stopScan } from "../../api";
import { Device } from "../../api/interface";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/tooltip";
import { App } from "antd";

export const AddDevice = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Device[]>([]);
  const { message } = App.useApp();
  useEffect(() => {
    startScan((data) => {
      setData(data);
    }).catch((err) => {
      message.error(err.message);
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

        <Tooltip placement="left" color="primary" content={<p>刷新</p>}>
          <Button
            onClick={async () => {
              setData(await getDevices());
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
                className="w-[370px] cursor-pointer"
                isPressable
                onPress={() => {
                  navigate(`/devices/add/${item.id}`);
                }}
              >
                <CardBody className="text-small text-default-600 gap-3 flex-row items-center dark:bg-content2">
                  <div className="w-10 h-10 rounded-full flex justify-center items-center bg-primary-400 flex-shrink-0 text-content1">
                    <LightbulbIcon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-medium">{item.local_name || "未知"}</p>
                    <p className="text-default-500 text-nowrap">{item.id}</p>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </ScrollShadow>
    </div>
  );
};

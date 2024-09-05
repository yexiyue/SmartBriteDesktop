import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { cn } from "@nextui-org/theme";
import { Tooltip } from "@nextui-org/tooltip";
import { App } from "antd";
import { RefreshCcw, SearchIcon, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDevices, startScan, stopScan } from "../../api";
import { Device } from "../../api/interface";
import { DeviceItem } from "../../components/devices/DeviceItem";
import { useDeviceStore } from "../../stores/useDeviceStore";

export const Devices = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [devices] = useDeviceStore((store) => [store.devices]);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<Device[]>([]);
  const ids = new Set(data.map((item) => item.id));

  useEffect(() => {
    setRefreshing(true);
    startScan((data) => {
      if (data.length > 0) {
        setData(data);
        // setScanning(false);
      }
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
    setTimeout(() => {
      stopScan();
    }, 5000);
    return () => {
      stopScan();
    };
  }, []);

  return (
    <div className="w-full h-full relative flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <Breadcrumbs variant="solid">
          <BreadcrumbItem startContent={<Smartphone className="w-4 h-4" />}>
            设备
          </BreadcrumbItem>
        </Breadcrumbs>
        <div className="flex gap-4">
          <Input
            size="sm"
            className="w-[240px]"
            startContent={<SearchIcon className="w-4 h-4" />}
            placeholder="搜索设备"
            value={search}
            onValueChange={setSearch}
          />
          <Button
            onClick={() => {
              navigate("/devices/add");
            }}
            size="sm"
            color="primary"
          >
            添加设备
          </Button>
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
      </div>
      <ScrollShadow className="flex-1 p-4" hideScrollBar>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 w-full justify-items-center">
          {devices.map((item) => {
            return (
              <DeviceItem
                data={item}
                key={item.id}
                disable={!ids.has(item.id)}
              />
            );
          })}
        </div>
      </ScrollShadow>
    </div>
  );
};

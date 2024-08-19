import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { SearchIcon, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeviceItem } from "../../components/DeviceItem";
import { useDeviceStore } from "../../stores/useDeviceStore";
import { App } from "antd";
import { startScan, stopScan } from "../../api";

export const Devices = () => {
  const [search, setSearch] = useState("");
  const [devices] = useDeviceStore((store) => [store.devices]);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [scaning, setScanning] = useState(false);
  useEffect(() => {
    setScanning(true);
    startScan((data) => {
      
    }).catch((err) => {
      message.error(err.message);
    });
    setTimeout(() => {
      startScan();
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
        </div>
      </div>
      <ScrollShadow className="flex-1 p-4" hideScrollBar>
        {devices.map((item) => {
          return <DeviceItem data={item} key={item.id} />;
        })}
      </ScrollShadow>
    </div>
  );
};

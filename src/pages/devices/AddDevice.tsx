import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { Button } from "@nextui-org/button";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { connectDevice, init, startScan, stopScan, control } from "../../api";

export const AddDevice = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full relative flex flex-col">
      <div className="p-4 flex justify-between items-center">
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
      </div>
      <ScrollShadow className="flex-1 p-4 pt-0" hideScrollBar>
        <Button
          onClick={async () => {
            await init();
            await startScan((data) => {
              console.log(data);
            });
            setTimeout(() => {
              stopScan();
            }, 5000);
          }}
        >
          扫描设备
        </Button>
        <Button
          onClick={async () => {
            const res = await connectDevice(
              "db963e8c-f710-466e-459d-31875b11d665"
            );
            console.log(res);
          }}
        >
          获取设备
        </Button>

        <Button
          onClick={async () => {
            const res = await control(
              "db963e8c-f710-466e-459d-31875b11d665",
              "open"
            );
            console.log("开灯");
          }}
        >
          开灯
        </Button>
        <Button
          onClick={async () => {
            const res = await control(
              "db963e8c-f710-466e-459d-31875b11d665",
              "close"
            );
            console.log("关灯");
          }}
        >
          关灯
        </Button>
      </ScrollShadow>
    </div>
  );
};

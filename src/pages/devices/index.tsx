import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Microscope, SearchIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Devices = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  return (
    <div className="w-full h-full relative flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <Breadcrumbs variant="solid">
          <BreadcrumbItem startContent={<Microscope className="w-4 h-4" />}>
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
      <ScrollShadow className="flex-1 p-4 pt-0" hideScrollBar></ScrollShadow>
    </div>
  );
};

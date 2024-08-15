import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Switch } from "@nextui-org/switch";
import {
  AlarmClock,
  LayoutGrid,
  Microscope,
  MoonIcon,
  Settings,
  Smartphone,
  SunIcon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import Logo from "../assets/logo.svg";
export const Slider = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { pathname } = useLocation();
  const key = `/${pathname.split("/")[1]}`;
  return (
    <div className="relative h-full w-full">
      <div className="w-full flex justify-center p-4">
        <img className="h-20" src={Logo} />
      </div>
      <Divider />
      <div className="flex flex-col gap-2 p-4">
        <Button
          onClick={() => {
            navigate("/");
          }}
          color="primary"
          startContent={<LayoutGrid className="w-4 h-4" />}
          variant={key === "/" ? "flat" : "light"}
        >
          主页
        </Button>
        <Button
          onClick={() => {
            navigate("/devices");
          }}
          color="primary"
          startContent={<Smartphone className="w-4 h-4" />}
          variant={key === "/devices" ? "flat" : "light"}
        >
          设备
        </Button>
        <Button
          onClick={() => {
            navigate("/scenes");
          }}
          color="primary"
          startContent={<Microscope className="w-4 h-4" />}
          variant={key === "/scenes" ? "flat" : "light"}
        >
          场景
        </Button>
        <Button
          onClick={() => {
            navigate("/schedule");
          }}
          color="primary"
          startContent={<AlarmClock className="w-4 h-4" />}
          variant={key === "/schedule" ? "flat" : "light"}
        >
          定时
        </Button>
      </div>
      <div className="flex justify-center absolute bottom-4 w-full gap-4">
        <Switch
          isSelected={theme === "light"}
          onChange={(e) => {
            setTheme(e.target.checked ? "light" : "dark");
          }}
          size="md"
          color="warning"
          startContent={<SunIcon />}
          endContent={<MoonIcon />}
        ></Switch>
        <Button isIconOnly size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

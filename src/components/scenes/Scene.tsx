import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import { Divider } from "@nextui-org/divider";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { CirclePower, Trash2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ScenesConfig } from "../../stores/useScenesStore";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import chroma from "chroma-js";
import { cn } from "@nextui-org/theme";

type SceneProps = {
  data: ScenesConfig;
  onDelete?: (data: ScenesConfig) => void;
  onClick?: (data: ScenesConfig) => void;
};
export const Scene = ({ data, onClick, onDelete }: SceneProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (cardRef.current) {
      if (data.type === "solid") {
        cardRef.current.style.setProperty("--scene-border-color", data.color);
        cardRef.current.style.backgroundImage = `radial-gradient(circle at 150px 40px,${data.color} 0%,transparent 50%)`;
      } else {
        const colors = data.colors?.map((item) => {
          return item.color;
        });
        const gradientColor = `linear-gradient(45deg,${colors.join(",")})`;
        cardRef.current.style.setProperty(
          "--scene-border-color",
          gradientColor
        );
        const color = chroma.average(colors).css();
        cardRef.current.style.setProperty(
          "--scene-bg-gradient",
          `radial-gradient(circle at 150px 40px,${color} 0%,transparent 50%)`
        );
      }
    }
  }, [data]);

  return (
    <>
      <Card
        ref={cardRef}
        className={cn(
          "w-[220px] h-[158px] cursor-pointer transition-all relative overflow-visible z-10 flex-shrink-0",
          data.type === "solid"
            ? ` before:content-[''] before:absolute before:top-[-1px]  before:left-[-1px] before:bottom-[-1px] before:right-[-1px] hover:before:border hover:before:border-[var(--scene-border-color,transparent)] before:rounded-medium before:animate-clipPath
        after:content-[''] after:absolute after:top-[-1px]  after:left-[-1px] after:bottom-[-1px] after:right-[-1px] hover:after:border hover:after:border-[var(--scene-border-color,transparent)] after:rounded-medium after:animate-clipPath2`
            : `before:z-[-2] before:content-[''] before:top-[-1px] before:left-[-1px] before:bottom-[-1px] before:right-[-1px] before:absolute hover:before:[background-image:var(--scene-border-color,transparent)] before:[background-size:300%] before:rounded-medium before:animate-background
         after:z-[-1] after:content-[''] after:absolute after:left-0 after:top-0 after:bottom-0 after:right-0 after:bg-content1 after:rounded-medium after:[background-image:var(--scene-bg-gradient,transparent)] after:transition-all`
        )}
        isPressable={!data.isBuiltin}
        onClick={() => {
          onClick?.(data);
        }}
      >
        <CardHeader>{data.name}</CardHeader>
        <Divider />
        <CardBody className="py-0">
          <ScrollShadow hideScrollBar className="pt-2 flex flex-col gap-2">
            <p className="text-default-500 text-small">{data.description}</p>
            <div className="flex gap-2 items-center flex-wrap">
              {data.autoOn && (
                <Chip
                  color="primary"
                  variant="flat"
                  size="sm"
                  startContent={<CirclePower className="w-4 h-4" />}
                >
                  自动开灯
                </Chip>
              )}
              <Chip color="primary" size="sm" variant="flat">
                {data.type === "solid" ? "单色" : "渐变"}
              </Chip>
              {data.type === "gradient" && (
                <Chip color="primary" size="sm" variant="flat">
                  {data.linear ? "线性" : "闪烁"}
                </Chip>
              )}
            </div>
          </ScrollShadow>
        </CardBody>
        <CardFooter className="justify-end pt-0">
          {!data.isBuiltin && (
            <Button
              size="sm"
              color="danger"
              variant="light"
              isIconOnly
              onClick={() => setIsOpen(true)}
            >
              <Trash2Icon className="w-4 h-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
      <Modal size="sm" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalContent>
          <ModalHeader className=" text-warning-400">警告</ModalHeader>
          <ModalBody className=" text-default-600">
            删除该场景会导致某些设备不能使用，确定要删除该场景吗？
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              取消
            </Button>
            <Button
              color="danger"
              variant="light"
              onClick={() => onDelete?.(data)}
            >
              确定
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { CirclePower, Timer, Trash2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ScenesConfig } from "../stores/useScenesStore";
import { Divider } from "@nextui-org/divider";
import { useColorPicker } from "react-best-gradient-color-picker";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";

type SceneProps = {
  data: ScenesConfig;
  onDelete?: (data: ScenesConfig) => void;
  onClick?: (data: ScenesConfig) => void;
};
export const Scene = ({ data, onClick, onDelete }: SceneProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { getGradientObject } = useColorPicker(data.color, () => {});
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let timer: number;
    if (cardRef.current) {
      cardRef.current.style.setProperty("--scene-border-color", data.color);
      const colorObj = getGradientObject();
      if (!colorObj?.isGradient) {
        cardRef.current.style.backgroundImage = `radial-gradient(circle at 150px 40px,${colorObj?.colors[0].value} 0%,transparent 50%)`;
      } else {
        const colors = colorObj?.colors
          .map(
            (item: { value: string; left: number }) =>
              `${item.value} ${Math.floor(item.left / 3)}%`
          )
          .join(",");
        cardRef.current.style.setProperty(
          "--scene-bg-gradient",
          `radial-gradient(circle at 100% 20%,${colors},transparent 50%)`
        );
      }
    }
    return () => {
      clearInterval(timer);
    };
  }, [data.color]);

  const solid = ` before:content-[''] before:absolute before:top-[-1px]  before:left-[-1px] before:bottom-[-1px] before:right-[-1px] hover:before:border hover:before:border-[var(--scene-border-color,transparent)] before:rounded-medium before:animate-clipPath
        after:content-[''] after:absolute after:top-[-1px]  after:left-[-1px] after:bottom-[-1px] after:right-[-1px] hover:after:border hover:after:border-[var(--scene-border-color,transparent)] after:rounded-medium after:animate-clipPath2
        `;
  const gradient = `before:z-[-2] before:content-[''] before:top-[-1px] before:left-[-1px] before:bottom-[-1px] before:right-[-1px] before:absolute hover:before:[background-image:var(--scene-border-color,transparent)] before:[background-size:300%] before:rounded-medium before:animate-background
         after:z-[-1] after:content-[''] after:absolute after:left-0 after:top-0 after:bottom-0 after:right-0 after:bg-content1 after:rounded-medium after:[background-image:var(--scene-bg-gradient,transparent)] after:transition-all`;

  return (
    <>
      <Card
        ref={cardRef}
        className={` w-[220px] h-[158px] cursor-pointer transition-all relative overflow-visible z-10
          ${data.type === "solid" ? solid : gradient}
        `}
        isPressable
        onClick={() => {
          onClick?.(data);
        }}
      >
        <CardHeader>{data.name}</CardHeader>
        <Divider />
        <CardBody className="py-0">
          <ScrollShadow hideScrollBar className="pt-2">
            <p className="text-default-500 text-small">{data.description}</p>
            {data.type === "gradient" && (
              <Chip
                color="primary"
                variant="flat"
                startContent={<Timer className="w-4 h-4" />}
              >
                {data.duration}
              </Chip>
            )}
            {data.autoOn && (
              <Chip
                color="primary"
                variant="flat"
                startContent={<CirclePower className="w-4 h-4" />}
              >
                自动开灯
              </Chip>
            )}
          </ScrollShadow>
        </CardBody>
        <CardFooter className="justify-end pt-2">
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
          <ModalBody>
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

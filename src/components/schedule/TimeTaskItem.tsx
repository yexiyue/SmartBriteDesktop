import { parseAbsoluteToLocal } from "@internationalized/date";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import { TimeInput } from "@nextui-org/date-input";
import { DatePicker } from "@nextui-org/date-picker";
import { Divider } from "@nextui-org/divider";
import { Lightbulb, LightbulbOff, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { TimeTask } from "../../stores/useTimeTaskStore";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";

const weekdays = ["一", "二", "三", "四", "五", "六", "日"];

type TimeTaskItemProps = {
  timeTask: TimeTask;
  onEdit?: (config: TimeTask) => void;
  onDelete?: (config: TimeTask) => void;
};

export const TimeTaskItem = ({ timeTask, onDelete }: TimeTaskItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Card>
        <CardHeader className="justify-between items-center h-10">
          <p>{timeTask.name}</p>
          <Button
            size="sm"
            color="danger"
            variant="light"
            isIconOnly
            onClick={() => setIsOpen(true)}
          >
            <Trash2Icon className="w-4 h-4" />
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="w-[220px]">
          {timeTask.kind === "once" && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Chip color="primary" size="sm" variant="flat">
                  一次
                </Chip>
                <Chip
                  color="primary"
                  size="sm"
                  variant="flat"
                  startContent={
                    timeTask.operation === "open" ? (
                      <Lightbulb className="w-4 h-4" />
                    ) : (
                      <LightbulbOff className="w-4 h-4" />
                    )
                  }
                >
                  {timeTask.operation === "open" && "开灯"}
                  {timeTask.operation === "close" && "关灯"}
                </Chip>
              </div>
              <DatePicker
                showMonthAndYearPickers
                hideTimeZone
                value={parseAbsoluteToLocal(timeTask.endTime)}
                isDisabled
              />
            </div>
          )}
          {timeTask.kind === "day" && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Chip color="primary" size="sm" variant="flat">
                  每天
                </Chip>
                <Chip
                  color="primary"
                  size="sm"
                  variant="flat"
                  startContent={
                    timeTask.operation === "open" ? (
                      <Lightbulb className="w-4 h-4" />
                    ) : (
                      <LightbulbOff className="w-4 h-4" />
                    )
                  }
                >
                  {timeTask.operation === "open" && "开灯"}
                  {timeTask.operation === "close" && "关灯"}
                </Chip>
              </div>
              <TimeInput
                hideTimeZone
                value={parseAbsoluteToLocal(timeTask.delay)}
                isDisabled
              />
            </div>
          )}
          {timeTask.kind === "week" && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Chip color="primary" size="sm" variant="flat">
                  星期{weekdays[timeTask.dayOfWeek - 1]}
                </Chip>
                <Chip
                  color="primary"
                  size="sm"
                  variant="flat"
                  startContent={
                    timeTask.operation === "open" ? (
                      <Lightbulb className="w-4 h-4" />
                    ) : (
                      <LightbulbOff className="w-4 h-4" />
                    )
                  }
                >
                  {timeTask.operation === "open" && "开灯"}
                  {timeTask.operation === "close" && "关灯"}
                </Chip>
              </div>
              <TimeInput
                hideTimeZone
                value={parseAbsoluteToLocal(timeTask.delay)}
                isDisabled
              />
            </div>
          )}
        </CardBody>
      </Card>
      <Modal size="sm" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalContent>
          <ModalHeader className=" text-warning-400">提示</ModalHeader>
          <ModalBody className=" text-default-600">
            删除该定时任务并不会清除设备上的定时任务，如果要取消该定时任务请前往设备页面取消定时任务。
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
              onClick={() => {
                onDelete?.(timeTask);
                setIsOpen(false);
              }}
            >
              确定
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

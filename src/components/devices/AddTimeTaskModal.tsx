import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { TimeTask, useTimeTaskStore } from "../../stores/useTimeTaskStore";
import { Select, SelectItem } from "@nextui-org/select";
import { getTime, MiniTimeTask } from "../schedule/MiniTimeTask";
import dayjs from "dayjs";
import { Code } from "@nextui-org/code";

export type AddTimeTaskModalRef = {
  open: () => void;
};

type AddTimeTaskModalProps = {
  onCreate?: (config: TimeTask) => void;
};

export const AddTimeTaskModal = forwardRef<
  AddTimeTaskModalRef,
  AddTimeTaskModalProps
>(({ onCreate }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeTasks] = useTimeTaskStore((store) => [store.timeTasks]);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();
  const currentTimeTask = useMemo(() => {
    return timeTasks.find((task) => task.name === value);
  }, [timeTasks, value]);

  const timeDelay = useMemo(() => {
    if (currentTimeTask) {
      if (currentTimeTask.kind === "once") {
        if (dayjs(currentTimeTask.endTime).diff(dayjs()) < 0) {
          return false;
        }
      }
      return getTime(currentTimeTask);
    }
  }, [value]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        setValue("");
        setIsOpen(true);
      },
    }),
    []
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      className=" max-w-sm"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              添加时间任务
            </ModalHeader>
            <ModalBody>
              <Select
                items={timeTasks}
                label="定时任务"
                placeholder="请选择定时任务"
                labelPlacement="outside"
                value={value}
                onChange={(e) => {
                  let value = e.target.value;
                  setValue(value);
                  if (value) {
                    if (!timeTasks.find((item) => item.name === value)) {
                      setError("定时任务不存在");
                    } else {
                      setError(undefined);
                    }
                  } else {
                    setError("请选择定时任务");
                  }
                }}
                renderValue={(items) => {
                  return items.map((item) => (
                    <MiniTimeTask timeTask={item.data!} key={item.key} />
                  ));
                }}
                isInvalid={!!error}
                errorMessage={error}
              >
                {(item) => (
                  <SelectItem key={item.name}>
                    <MiniTimeTask timeTask={item} />
                  </SelectItem>
                )}
              </Select>
              {timeDelay && currentTimeTask && (
                <Code color="success">
                  将在{timeDelay.days}天，{timeDelay.hours}小时，
                  {timeDelay.minutes}分钟后
                  {currentTimeTask.operation === "open" ? "开灯" : "关灯"}
                </Code>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                取消
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  if (timeDelay === false) {
                    return setError("该任务已过期，请重新选择");
                  }
                  if (value && currentTimeTask) {
                    onCreate?.(currentTimeTask);
                    onClose();
                  } else {
                    setError("请选择时间任务");
                  }
                }}
              >
                确定
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
});

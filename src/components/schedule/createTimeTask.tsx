import { Button } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import { Tab, Tabs } from "@nextui-org/tabs";
import {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { TimeTask, useTimeTaskStore } from "../../stores/useTimeTaskStore";

export type CreateTimeTaskProps = {
  onCreate?: (config: TimeTask) => void;
  onEdit?: (currentName: string, config: TimeTask) => void;
};

export type CreateTimeTaskRef = {
  open: () => void;
  edit: (config: TimeTask) => void;
};

const CreateTimeTask = (
  props: CreateTimeTaskProps,
  ref: ForwardedRef<CreateTimeTaskRef>
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [scenes] = useTimeTaskStore((store) => [store.timeTasks]);

  const names = useMemo(() => {
    return scenes.map((item) => item.name);
  }, [scenes]);

  const currentName = useRef<string>("");
  const { control, setValue, reset, trigger } = useForm({});

  const data = useWatch({
    control,
  });

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        setIsOpen(true);
      },
      edit: (config) => {
        setIsOpen(true);
        setIsEdit(true);
        currentName.current = config.name;
        setValue("name", config.name);
        setValue("kind", config.kind);
      },
    }),
    []
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setIsEdit(false);
        reset();
      }}
    >
      <ModalContent className="w-[380px] text-default-600">
        <ModalHeader>{isEdit ? "编辑场景" : "创建场景"}</ModalHeader>
        <ModalBody className="flex flex-col gap-4">
          <div className="flex justify-between">
            <Controller
              name="kind"
              control={control}
              render={({ field }) => (
                <Tabs
                  size="sm"
                  aria-label="time-task-kind-select"
                  selectedKey={field.value}
                  onSelectionChange={field.onChange}
                >
                  <Tab key="once" title="一次" />
                  <Tab key="day" title="每天" />
                  <Tab key="week" title="每周" />
                </Tabs>
              )}
            />
          </div>

          <Controller
            name="name"
            control={control}
            rules={{
              required: "场景名称不能为空",
              validate: (value) => {
                let newNames = names;
                if (isEdit) {
                  newNames = names.filter(
                    (item) => item !== currentName.current
                  );
                }
                if (newNames.includes(value)) {
                  return `场景名称${value}已被使用`;
                } else if (value.length > 20) {
                  return "场景名称不能超过20个字符";
                } else if (!value.trim()) {
                  return "场景名称不能为空";
                }
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <Input
                label="场景名称"
                size="sm"
                isRequired
                {...field}
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={() => {
                  trigger("name");
                }}
              />
            )}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            onClick={() => {
              setIsOpen(false);
              setIsEdit(false);
              reset();
            }}
          >
            取消
          </Button>
          <Button
            color="primary"
            onClick={async () => {
              const validated = await trigger();
              if (validated) {
                if (isEdit) {
                  props.onEdit?.(currentName.current, data as any);
                } else {
                  props.onCreate?.(data as any);
                }
                setIsOpen(false);
                setIsEdit(false);
                reset();
              }
            }}
          >
            {isEdit ? "保存" : "创建"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default forwardRef<CreateTimeTaskRef, CreateTimeTaskProps>(
  CreateTimeTask
);

import {
  getLocalTimeZone,
  now,
  parseAbsoluteToLocal,
} from "@internationalized/date";
import { Button } from "@nextui-org/button";
import { TimeInput } from "@nextui-org/date-input";
import { DatePicker } from "@nextui-org/date-picker";
import { Input } from "@nextui-org/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import { Select, SelectItem } from "@nextui-org/select";
import { Tab, Tabs } from "@nextui-org/tabs";
import { LightbulbIcon, LightbulbOffIcon } from "lucide-react";
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
  const { control, setValue, reset, trigger } = useForm<TimeTask>();

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
        <ModalHeader>{isEdit ? "编辑定时任务" : "创建定时任务"}</ModalHeader>
        <ModalBody className="flex flex-col gap-4">
          <div className="flex justify-between">
            <Controller
              name="kind"
              control={control}
              render={({ field }) => (
                <Tabs
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
              required: "定时任务名称不能为空",
              validate: (value) => {
                let newNames = names;
                if (isEdit) {
                  newNames = names.filter(
                    (item) => item !== currentName.current
                  );
                }
                if (newNames.includes(value)) {
                  return `定时任务名称${value}已被使用`;
                } else if (value.length > 20) {
                  return "定时任务名称不能超过20个字符";
                } else if (!value.trim()) {
                  return "定时任务名称不能为空";
                }
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="定时任务名称"
                isRequired
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
                value={field.value}
                maxLength={20}
                onValueChange={field.onChange}
                onBlur={() => {
                  trigger("name");
                }}
              />
            )}
          />
          <Controller
            name="operation"
            control={control}
            rules={{
              required: "操作不能为空",
            }}
            defaultValue="open"
            render={({ field, fieldState }) => (
              <Select
                {...field}
                items={[
                  {
                    label: "开灯",
                    key: "open",
                    icon: <LightbulbIcon className="w-4 h-4" />,
                  },
                  {
                    label: "关灯",
                    key: "close",
                    icon: <LightbulbOffIcon className="w-4 h-4" />,
                  },
                ]}
                label="操作"
                selectedKeys={[field.value]}
                isRequired
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
                onBlur={() => {
                  trigger("operation");
                }}
                selectionMode="single"
                renderValue={(items) => {
                  return items.map((item) => (
                    <div key={item.key} className="flex items-center gap-2">
                      <span className="text-default-500">
                        {item.data?.icon}
                      </span>
                      <span>{item.data?.label}</span>
                    </div>
                  ));
                }}
              >
                {(operations) => (
                  <SelectItem
                    key={operations.key}
                    textValue={operations.key}
                    startContent={operations.icon}
                    className="text-default-500"
                  >
                    <p className=" text-default-700">{operations.label}</p>
                  </SelectItem>
                )}
              </Select>
            )}
          />
          {data.kind === "week" && (
            <Controller
              name="dayOfWeek"
              control={control}
              rules={{
                required: "星期不能为空",
              }}
              defaultValue={1}
              render={({ field, fieldState }) => (
                <Select
                  {...field}
                  items={[
                    {
                      label: "星期一",
                      key: 1,
                    },
                    {
                      label: "星期二",
                      key: 2,
                    },
                    {
                      label: "星期三",
                      key: 3,
                    },
                    {
                      label: "星期四",
                      key: 4,
                    },
                    {
                      label: "星期五",
                      key: 5,
                    },
                    {
                      label: "星期六",
                      key: 6,
                    },
                    {
                      label: "星期日",
                      key: 7,
                    },
                  ]}
                  label="星期"
                  selectedKeys={[`${field.value}`]}
                  isRequired
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  onBlur={() => {
                    trigger("dayOfWeek");
                  }}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                  selectionMode="single"
                >
                  {(operations) => (
                    <SelectItem
                      key={operations.key}
                      className="text-default-500"
                      textValue={operations.label}
                    >
                      <p className=" text-default-700">{operations.label}</p>
                    </SelectItem>
                  )}
                </Select>
              )}
            />
          )}
          {data.kind === "once" ? (
            <Controller
              name="endTime"
              control={control}
              defaultValue={now(getLocalTimeZone()).toAbsoluteString()}
              render={({ field }) => (
                <DatePicker
                  showMonthAndYearPickers
                  hideTimeZone
                  label="日期时间"
                  value={parseAbsoluteToLocal(field.value)}
                  minValue={now(getLocalTimeZone()).add({
                    minutes: 2,
                  })}
                  onChange={(v) => {
                    field.onChange(v.toAbsoluteString());
                  }}
                />
              )}
            />
          ) : (
            <Controller
              name="delay"
              control={control}
              defaultValue={now(getLocalTimeZone()).toAbsoluteString()}
              render={({ field }) => (
                <TimeInput
                  hideTimeZone
                  label="时间"
                  value={parseAbsoluteToLocal(field.value)}
                  onChange={(v) => {
                    field.onChange(v.toAbsoluteString());
                  }}
                />
              )}
            />
          )}
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
              let newData: any = {
                name: data.name,
                operation: data.operation,
                kind: data.kind,
              };

              if (data.kind === "once") {
                newData.endTime = data.endTime;
              } else if (data.kind === "day") {
                newData.delay = data.delay;
              } else if (data.kind === "week") {
                newData.dayOfWeek = data.dayOfWeek;
                newData.delay = data.delay;
              }

              if (validated) {
                if (isEdit) {
                  props.onEdit?.(currentName.current, newData);
                } else {
                  props.onCreate?.(newData);
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

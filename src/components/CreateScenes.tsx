import { Button } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import { Switch } from "@nextui-org/switch";
import { Tab, Tabs } from "@nextui-org/tabs";
import { semanticColors } from "@nextui-org/theme";
import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ColorPopover } from "./ColorPopover";
import { ScenesConfig, useScenesStore } from "../stores/useScenesStore";

export type CreateScenesProps = {
  onCreate?: (config: ScenesConfig) => void;
  onEdit?: (currentName: string, config: ScenesConfig) => void;
};

export type CreateScenesRef = {
  open: () => void;
  edit: (config: ScenesConfig) => void;
};

const CreateScenes = (
  props: CreateScenesProps,
  ref: ForwardedRef<CreateScenesRef>
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [scenes] = useScenesStore((store) => [store.scenes]);
  const names = useMemo(() => {
    return scenes.map((item) => item.name);
  }, [scenes]);
  const currentName = useRef<string>("");
  const { control, setValue, reset, trigger } = useForm<ScenesConfig>({
    defaultValues: {
      type: "solid",
      name: "",
      color: semanticColors.light.primary[500],
      autoOn: false,
    },
  });
  const data = useWatch({
    control,
  });

  useEffect(() => {
    if (data.type === "gradient") {
      setValue("duration", 30);
    }
  }, [data.type]);

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
        setValue("color", config.color);
        setValue("autoOn", config.autoOn);
        setValue("type", config.type);
        setValue("description", config.description);
        if (config.type === "gradient") {
          setValue("duration", config.duration);
        }
      },
    }),
    []
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        reset();
      }}
    >
      <ModalContent className="w-[380px]">
        <ModalHeader>{isEdit ? "编辑场景" : "创建场景"}</ModalHeader>
        <ModalBody className="flex flex-col gap-4">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Tabs
                size="md"
                selectedKey={field.value}
                onSelectionChange={field.onChange}
              >
                <Tab key="solid" title="单色" />
                <Tab key="gradient" title="渐变" />
              </Tabs>
            )}
          />
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
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                maxRows={2}
                label="场景描述"
                size="sm"
                {...field}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />

          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <ColorPopover
                {...field}
                type={data.type}
                onTypeChange={(type) => {
                  setValue("type", type);
                }}
              />
            )}
          />
          <Controller
            name="autoOn"
            control={control}
            render={({ field }) => (
              <Switch
                isSelected={field.value}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                }}
              >
                自动开灯
              </Switch>
            )}
          />
          {data.type === "gradient" && (
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <Input
                  {...(field as any)}
                  label="渐变时长"
                  size="sm"
                  type="number"
                  endContent={"秒"}
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

export default forwardRef<CreateScenesRef, CreateScenesProps>(CreateScenes);

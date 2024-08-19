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
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ColorPopover } from "./ColorPopover";
import { ScenesConfig, useScenesStore } from "../../stores/useScenesStore";
import chroma from "chroma-js";
import { Colors } from "./Colors";

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
  const { control, setValue, reset, trigger } =
    useForm<ScenesConfig>({
      defaultValues: {
        type: "solid",
        name: "",
        autoOn: false,
        color: chroma(
          semanticColors.light.warning[500] ?? "rgb(255, 165, 0)"
        ).hex("rgb"),
      },
    });

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
        setValue("autoOn", config.autoOn);
        setValue("type", config.type);
        setValue("description", config.description || "");
        if (config.type === "gradient") {
          setValue("linear", config.linear);
          setValue("colors", config.colors);
        } else {
          setValue("color", config.color);
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
        setIsEdit(false);
        reset();
      }}
    >
      <ModalContent className="w-[380px] text-default-600">
        <ModalHeader>{isEdit ? "编辑场景" : "创建场景"}</ModalHeader>
        <ModalBody className="flex flex-col gap-4">
          <div className="flex justify-between">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Tabs
                  size="sm"
                  selectedKey={field.value}
                  onSelectionChange={field.onChange}
                >
                  <Tab key="solid" title="单色" />
                  <Tab key="gradient" title="渐变" />
                </Tabs>
              )}
            />
            {data.type === "gradient" && (
              <Controller
                name="linear"
                control={control}
                render={({ field }) => (
                  <Switch
                    isSelected={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked);
                    }}
                    size="sm"
                  >
                    线性渐变
                  </Switch>
                )}
              />
            )}
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

          {data.type == "solid" && (
            <Controller
              name="color"
              control={control}
              render={({ field }) => <ColorPopover {...field} />}
            />
          )}

          {data.type == "gradient" && (
            <Controller
              name="colors"
              defaultValue={[
                {
                  color: chroma.random().hex("rgb"),
                  duration: 2,
                },
                {
                  color: chroma.random().hex("rgb"),
                  duration: 2,
                },
              ]}
              control={control}
              render={({ field }) => <Colors {...field} />}
            />
          )}

          <Controller
            name="autoOn"
            control={control}
            render={({ field }) => (
              <Switch
                isSelected={field.value}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                }}
                size="sm"
              >
                自动开灯
              </Switch>
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

export default forwardRef<CreateScenesRef, CreateScenesProps>(CreateScenes);

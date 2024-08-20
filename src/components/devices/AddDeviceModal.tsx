import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import { Spinner } from "@nextui-org/spinner";
import { Lightbulb, LightbulbOff } from "lucide-react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Device } from "../../api/interface";
import { useLedControl } from "../../hooks/useLedControl";
import { useDeviceStore } from "../../stores/useDeviceStore";
import { SceneItem } from "../scenes/SceneItem";
import { App } from "antd";

export type AddDeviceModalRef = {
  open: (device: Device) => void;
};

export const AddDeviceModal = forwardRef<AddDeviceModalRef, {}>(
  (_props, ref) => {
    const [device, setDevice] = useState<Device>();
    const [isOpen, setIsOpen] = useState(false);
    const { ledDevice, ledScene, isCollected, isCollecting, ledState } =
      useLedControl(device);
    const { message } = App.useApp();
    const [addDevice] = useDeviceStore((store) => [store.addDevice]);
    const onClose = () => {
      setIsOpen(false);
      setDevice(undefined);
    };

    useImperativeHandle(
      ref,
      () => ({
        open: (device: Device) => {
          setDevice(device);
          setIsOpen(true);
        },
      }),
      []
    );

    return (
      <Modal isOpen={isOpen} className=" max-w-sm" onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-default-700">
                添加设备
              </ModalHeader>
              <ModalBody>
                <Chip
                  color={isCollected ? "success" : "danger"}
                  variant="dot"
                  startContent={
                    isCollecting && <Spinner color="warning" size="sm" />
                  }
                  endContent={
                    ledState === "opened" ? (
                      <Lightbulb className="w-4 h-4 text-default-500" />
                    ) : (
                      <LightbulbOff className="w-4 h-4 text-default-500" />
                    )
                  }
                  className="rounded-small border"
                >
                  {ledDevice?.local_name || "未知"}
                </Chip>
                <p className="text-tiny text-default-400">
                  设备ID：{ledDevice?.id}
                </p>
                <div className="flex items-center">
                  <p className="text-tiny text-default-400">设备当前场景：</p>
                  <SceneItem scene={ledScene} />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  关闭
                </Button>
                <Button
                  color="primary"
                  isLoading={isCollecting}
                  isDisabled={!isCollected}
                  onPress={() => {
                    if (device) {
                      addDevice(device);
                      message.success(`添加设备 (${device.id}) 成功`);
                    }
                    onClose();
                  }}
                >
                  添加
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  }
);

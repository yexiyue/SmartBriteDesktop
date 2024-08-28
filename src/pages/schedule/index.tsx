import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Tooltip } from "@nextui-org/tooltip";
import { AlarmClock, Inbox, PlusIcon, SearchIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useTimeTaskStore } from "../../stores/useTimeTaskStore";
import CreateTimeTask, {
  CreateTimeTaskRef,
} from "../../components/schedule/createTimeTask";

export const Schedule = () => {
  const createTimeTaskRef = useRef<CreateTimeTaskRef>(null);
  const [search, setSearch] = useState("");
  const [scenes, addScene, removeScene, updateScene] = useTimeTaskStore(
    (store) => [
      store.timeTasks,
      store.addTimeTask,
      store.removeTimeTask,
      store.updateTimeTask,
    ]
  );

  const searchedScenes = useMemo(() => {
    if (search) {
      return scenes.filter((item) => {
        return item.name.includes(search);
      });
    } else {
      return scenes;
    }
  }, [scenes, search]);

  return (
    <div className="w-full h-full relative flex flex-col">
      <div className="p-4 pb-0 flex justify-between items-center">
        <Breadcrumbs variant="solid">
          <BreadcrumbItem startContent={<AlarmClock className="w-4 h-4" />}>
            定时
          </BreadcrumbItem>
        </Breadcrumbs>
        <Input
          size="sm"
          className="w-[240px]"
          startContent={<SearchIcon className="w-4 h-4" />}
          placeholder="搜索定时任务"
          value={search}
          onValueChange={setSearch}
        />
      </div>
      <ScrollShadow className="flex-1 p-4" hideScrollBar>
        {searchedScenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Inbox size={24} className="text-default-500" />
            <p className="text-default-500 text-small">
              {scenes.length === 0 ? "暂无定时任务" : "未搜索到定时任务"}
            </p>
            {scenes.length === 0 && (
              <Button
                onClick={() => {
                  createTimeTaskRef.current?.open();
                }}
                color="primary"
                size="sm"
                className="mt-4"
                startContent={<PlusIcon className="w-4 h-4" />}
              >
                创建定时任务
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {searchedScenes.map((item) => {
              return <div>{item.name}</div>;
            })}
          </div>
        )}
      </ScrollShadow>

      <Tooltip content={<p>创建定时任务</p>} color="primary">
        <Button
          isIconOnly
          color="primary"
          radius="full"
          className=" absolute bottom-6 right-6"
          variant="shadow"
          onClick={() => {
            createTimeTaskRef.current?.open();
          }}
        >
          <PlusIcon />
        </Button>
      </Tooltip>
      <CreateTimeTask ref={createTimeTaskRef} />
    </div>
  );
};

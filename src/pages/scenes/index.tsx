import { Button } from "@nextui-org/button";
import CreateScenes, { CreateScenesRef } from "../../components/createScenes";
import { useMemo, useRef, useState } from "react";
import { Inbox, Microscope, PlusIcon, SearchIcon } from "lucide-react";
import { Tooltip } from "@nextui-org/tooltip";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { useScenesStore } from "../../stores/useScenesStore";
import { Scene } from "../../components/scenes/Scene";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Input } from "@nextui-org/input";

export const Scenes = () => {
  const createScenesRef = useRef<CreateScenesRef>(null);
  const [search, setSearch] = useState("");
  const [scenes, addScene, removeScene, updateScene] = useScenesStore(
    (store) => [
      store.scenes,
      store.addScene,
      store.removeScene,
      store.updateScene,
    ]
  );
  console.log(scenes);
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
          <BreadcrumbItem startContent={<Microscope className="w-4 h-4" />}>
            场景
          </BreadcrumbItem>
        </Breadcrumbs>
        <Input
          size="sm"
          className="w-[240px]"
          startContent={<SearchIcon className="w-4 h-4" />}
          placeholder="搜索场景"
          value={search}
          onValueChange={setSearch}
        />
      </div>
      <ScrollShadow className="flex-1 p-4" hideScrollBar>
        {searchedScenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Inbox size={24} className="text-default-500" />
            <p className="text-default-500 text-small">
              {scenes.length === 0 ? "暂无场景" : "未搜索到场景"}
            </p>
            {scenes.length === 0 && (
              <Button
                onClick={() => {
                  createScenesRef.current?.open();
                }}
                color="primary"
                size="sm"
                className="mt-4"
                startContent={<PlusIcon className="w-4 h-4" />}
              >
                创建场景
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {searchedScenes.map((item) => {
              return (
                <Scene
                  key={item.name}
                  data={item}
                  onDelete={(config) => {
                    removeScene(config.name);
                  }}
                  onClick={(config) => {
                    createScenesRef.current?.edit(config);
                  }}
                />
              );
            })}
          </div>
        )}
      </ScrollShadow>

      <Tooltip content={<p>创建场景</p>} color="primary">
        <Button
          onClick={() => {
            createScenesRef.current?.open();
          }}
          isIconOnly
          color="primary"
          radius="full"
          className=" absolute bottom-6 right-6"
          variant="shadow"
        >
          <PlusIcon />
        </Button>
      </Tooltip>
      <CreateScenes
        ref={createScenesRef}
        onCreate={(scene) => {
          addScene(scene);
        }}
        onEdit={updateScene}
      />
    </div>
  );
};

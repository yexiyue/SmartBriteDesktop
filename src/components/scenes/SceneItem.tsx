import { useMemo } from "react";
import { Scene } from "../../api/interface";
import chroma from "chroma-js";
import { Skeleton } from "@nextui-org/skeleton";

type SceneItemProps = {
  scene?: Scene;
};

export const SceneItem = ({ scene }: SceneItemProps) => {
  const color = useMemo(() => {
    if (scene) {
      if (scene.type === "solid") {
        return chroma(scene.color).css();
      } else {
        const colors = scene.colors.map((item) => chroma(item.color).css());
        return `linear-gradient(60deg, ${colors.join(", ")})`;
      }
    }
  }, [scene]);
  return scene ? (
    <div className="flex gap-2 items-center">
      <div
        className="w-6 h-6 rounded-full border"
        style={{
          background: color,
        }}
      ></div>
      <div className="flex flex-col">
        <span className="text-tiny text-default-500 group-data-[hover=true]:text-default-900">
          {scene?.name}
        </span>
        <span className="text-tiny text-default-400 group-data-[hover=true]:text-default-700">
          {scene?.type === "solid"
            ? "单色"
            : `渐变 (${scene?.linear ? "线性" : "闪烁"})`}
        </span>
      </div>
    </div>
  ) : (
    <div className="flex gap-2 items-center">
      <Skeleton className="rounded-full w-6 h-6 flex-shrink-0" />
      <div className="flex flex-col gap-2">
        <Skeleton className="rounded w-[60px] h-3" />
        <Skeleton className="rounded w-[100px] h-3" />
      </div>
    </div>
  );
};

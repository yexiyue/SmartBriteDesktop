import { ask } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, CheckOptions } from "@tauri-apps/plugin-updater";
import { useAsyncEffect, useMemoizedFn } from "ahooks";
import { App } from "antd";
import "dayjs/locale/zh-cn";
import dayjs from "dayjs";
dayjs.locale("zh-cn");

type UpdaterOptions = CheckOptions & {
  manual?: boolean;
};

export const useUpdater = (props: UpdaterOptions = {}) => {
  const { manual, ...checkOps } = props;

  const { message } = App.useApp();

  const checkAndUpdate = useMemoizedFn(async () => {
    const updater = await check(checkOps);

    if (updater) {
      if (updater.available) {
        try {
          const allowDownload = await ask(
            `检测到新版本 ${updater.version} 当前版本为 ${updater.currentVersion} 是否下载更新？
            `,
            {
              title: `提示`,
              kind: "info",
            }
          );
          if (allowDownload) {
            message.info({
              key: "updateApp",
              content: "开始更新",
            });
            await updater.downloadAndInstall((p) => {
              if (p.event === "Started") {
                message.loading({
                  key: "updateApp",
                  content: "下载更新中...",
                });
              } else if (p.event === "Finished") {
                message.success({
                  key: "updateApp",
                  content: "下载更新成功",
                });
              }
            });
            const res = await ask(`更新下载完成，是否立即重启应用？`, {
              title: `提示`,
              kind: "info",
            });
            if (res) {
              await relaunch();
            }
          }
        } catch (error) {
          message.error({
            key: "updater",
            content: "更新失败",
          });
        } finally {
          message.destroy("updateApp");
        }
      }
    }
  });

  useAsyncEffect(async () => {
    if (!manual) {
      try {
        await checkAndUpdate();
      } catch (error) {
        message.error(`获取更新信息失败`);
      }
    }
  }, []);

  return { checkAndUpdate };
};

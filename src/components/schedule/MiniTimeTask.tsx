import { Lightbulb, LightbulbOff } from "lucide-react";
import { TimeTask } from "../../stores/useTimeTaskStore";
import { weekdays } from "./TimeTaskItem";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import week from "dayjs/plugin/weekday";
dayjs.extend(utc);
dayjs.extend(week);

type MiniTimeTaskProps = {
  timeTask: TimeTask;
};

function dayDelay(time1: Dayjs) {
  let time2 = dayjs();
  let adjustTime = time2.hour(time1.hour()).minute(time1.minute()).second(0);
  if (adjustTime.isBefore(time2)) {
    adjustTime = adjustTime.add(1, "day");
  }
  const minutesDiff = adjustTime.diff(time2, "minutes");

  return {
    days: 0,
    hours: Math.floor(minutesDiff / 60),
    minutes: Math.floor(minutesDiff % 60),
  };
}

function weekDelay(time1: Dayjs, targetWeekday: number) {
  let time2 = dayjs();

  // 获取当前时间的星期几
  const currentWeekday = time1.day();

  // 计算距离目标星期几还需要多少天
  let daysToTarget = (targetWeekday - currentWeekday + 7) % 7;

  // 如果目标星期几在当前星期几之前，意味着目标星期几在下周
  if (daysToTarget === 0 && targetWeekday < currentWeekday) {
    daysToTarget = 7;
  }

  // 计算目标时间点
  const targetTime = time2.add(daysToTarget, "day").hour(time1.hour()).minute(time1.minute());

  // 计算剩余的时间差
  const diff = targetTime.diff(time2, "minute");

  // 将总分钟数拆分成天、小时和分钟
  const totalDays = Math.floor(diff / (24 * 60));
  const totalHours = Math.floor((diff % (24 * 60)) / 60);
  const totalMinutes = diff % 60;
  return {
    days: totalDays,
    hours: totalHours,
    minutes: totalMinutes,
  };
}

function onceDelay(time1: Dayjs) {
  let time2 = dayjs();
  const diff = time1.diff(time2, "minute");
  // 将总分钟数拆分成天、小时和分钟
  const totalDays = Math.floor(diff / (24 * 60));
  const totalHours = Math.floor((diff % (24 * 60)) / 60);
  const totalMinutes = diff % 60;
  return {
    days: totalDays,
    hours: totalHours,
    minutes: totalMinutes,
  };
}

export function getTime(timeTask: TimeTask) {
  switch (timeTask.kind) {
    case "once":
      return onceDelay(dayjs(timeTask.endTime));
    case "day":
      const target = dayjs(timeTask.delay);
      return dayDelay(target);
    case "week":
      const weekTarget = dayjs(timeTask.delay);
      return weekDelay(weekTarget, timeTask.dayOfWeek);
  }
}

export const MiniTimeTask = ({ timeTask }: MiniTimeTaskProps) => {
  return (
    <div className="flex gap-2 items-center">
      <div className="w-6 h-6 rounded-full border text-primary-700 flex justify-center items-center group-data-[hover=true]:border-primary-700">
        {timeTask?.operation === "open" ? (
          <Lightbulb className="w-4 h-4" />
        ) : (
          <LightbulbOff className="w-4 h-4" />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-tiny text-default-500 group-data-[hover=true]:text-default-900">
          {timeTask?.name}
        </span>
        <span className="text-tiny text-default-400 group-data-[hover=true]:text-default-700">
          {timeTask.kind === "once" && (
            <span>
              一次 {dayjs(timeTask.endTime).local().format("YYYY-MM-DD HH:mm")}
            </span>
          )}
          {timeTask.kind === "day" && (
            <span>每天 {dayjs(timeTask.delay).local().format("HH:mm")}</span>
          )}
          {timeTask.kind === "week" && (
            <span>
              星期{weekdays[timeTask.dayOfWeek - 1]}{" "}
              {dayjs(timeTask.delay).local().format("HH:mm")}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

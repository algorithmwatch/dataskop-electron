import { extractIdFromUrl } from "@algorithmwatch/harke-parser";
import { median } from "d3-array";
import _ from "lodash";
import dayjs from "../../../../shared/dayjs";

const getMaxRange = (dump) => {
  if (dump === null) return 365;
  const dates = dump.map((x) => x.time);
  const min = _.min(dates) as string;
  const max = _.max(dates) as string;
  return dayjs(max).diff(dayjs(min), "day");
};

// converts times to hours + mins if the times are over 60 mins, input is in mins
function convertTime(tot: number) {
  if (tot < 60) return `${Math.round(tot)}m`;
  const mins = tot % 60;
  const hrs = Math.floor(tot / 60);

  return `${hrs}h ${Math.round(mins)}m`;
}

// helper function for getting time of day
function getTimeOfDay(entryHour: number) {
  let timeOfDay = "";
  if (entryHour >= 6 && entryHour < 12) {
    timeOfDay = "vormittags";
  } else if (entryHour >= 12 && entryHour < 18) {
    timeOfDay = "nachmittags";
  } else if (entryHour >= 18 && entryHour < 24) {
    timeOfDay = "abends";
  } else if (entryHour >= 0 || entryHour < 6) {
    timeOfDay = "nachts";
  }

  return timeOfDay;
}

const arrangeDataVizOne = (
  dump: any,
  lookups: any,
  graph: "timeslots" | "skipped" | "default",
  timeRange: number,
): [string, string, string, any, any] => {
  const hours: number[] = [];
  const startDate = dayjs(dump[0].time);
  const temp = dump
    .map((x) => {
      const vId = `yv${extractIdFromUrl(x.titleUrl)}`;
      const duration = _.get(lookups, `${vId}.result.duration`, null);
      if (!duration) return null;

      const d = dayjs(x.time);
      if (startDate.diff(d, "day") > timeRange) {
        return null;
      }
      hours.push(d.hour());
      return {
        day: d.format("YYYY-MM-DD"),
        duration,
        timeOfDay: getTimeOfDay(d.hour()),
      };
    })
    .filter((x) => x);

  if (graph === "default") {
    const summed = temp.reduce((obj, el) => {
      obj[el.day] = (obj[el.day] || 0) + el.duration;
      return obj;
    }, {});

    let totalMin = 0;
    const result = Object.entries(summed).map((x) => {
      const min = x[1] / 1000 / 60;
      totalMin += min;
      return { Date: new Date(x[0]), TotalTime: min };
    });

    return [
      convertTime(totalMin),
      convertTime(totalMin / result.length),
      "",
      median(hours),
      result,
    ];
  }

  if (graph === "timeslots") {
    const summed = temp.reduce((obj, el) => {
      obj[`${el.day}!${el.timeOfDay}`] =
        (obj[`${el.day}!${el.timeOfDay}`] || 0) + el.duration;
      return obj;
    }, {});

    let totalMin = 0;
    const result = Object.entries(summed).map((x) => {
      const min = x[1] / 1000 / 60;
      totalMin += min;
      const [date, timeOfDay] = x[0].split("!");
      return { Date: new Date(date), TotalTime: min, TimeOfDay: timeOfDay };
    });

    const aggregates: any = {};

    result.forEach((x) => {
      const val = _.get(aggregates, x.TimeOfDay, 0);
      _.set(aggregates, x.TimeOfDay, val + x.TotalTime);
    });

    for (const k of Object.keys(aggregates)) {
      aggregates[k] /= totalMin / 100;
    }
    return ["", "", "", aggregates, result];
  }

  return ["", "", "", "", ""];
};

export { getMaxRange, arrangeDataVizOne };

import * as d3 from "d3";
import _ from "lodash";
import dayjs from "../../../../../shared/dayjs";
import { formatNumber } from "../../../../../shared/utils/time";

// 10 minutes between videos is acceptable
const GAP_WATCHED = 10 * 60;

export const getMaxRange = (dump) => {
  if (dump === null) return 365;
  const dates = dump["Activity"]["Video Browsing History"]["VideoList"].map(
    (x) => x.Date,
  );
  const min = _.min(dates) as string;
  const max = _.max(dates) as string;
  return dayjs(max).diff(dayjs(min), "day");
};

// helper function to check if dates are equal
const checkDatesEqual = (date1: Date, date2: Date) =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

// helper function for finding core time
function coreTime(
  coreTimeObj: { [key: string]: any },
  hour: number,
  gap: number,
) {
  if (hour in coreTimeObj) {
    coreTimeObj[hour] += gap;
  } else {
    coreTimeObj[hour] = gap;
  }

  return coreTimeObj;
}

// helper function for stripping Date objects of time
export function withoutTime(dateObj: Date) {
  return new Date(dateObj.toDateString());
}

// helper function for converting days to ms
export function convertDaysToMs(days: number) {
  return days * 24 * 60 * 60 * 1000;
}

// helper function for getting core time(s), an array is returned
function getCoreTime(coreTimeObj: any) {
  const vals = Object.values(coreTimeObj);
  const max = d3.max(vals);
  return Object.keys(coreTimeObj).filter((key) => coreTimeObj[key] === max);
}

// for single-color bars
function addTimeOfDay(
  ogVidData: any,
  timeRange: number,
): [{ Date: Date; TotalTime: number }[], number, string[]] {
  let dailyTime = 0;
  let totalTime = 0;
  const coreTimeObj = {};
  const result = [];

  let datePrev = new Date(ogVidData[0].Date);

  // compute date you want to stop looping
  const dateToStop = new Date(
    +withoutTime(datePrev) - convertDaysToMs(timeRange - 1),
  );

  for (const entry of ogVidData) {
    const dateCurr = new Date(entry.Date);
    const timePrev = datePrev.getTime();

    // stop looping when you reach end selected range
    if (dateCurr < dateToStop) {
      break;
    }

    const timeCurr = dateCurr.getTime();

    const gap = Number((timePrev - timeCurr) / 1000 / 60);

    if (gap * 60 < GAP_WATCHED) {
      dailyTime += gap;
      totalTime += gap;
      coreTime(coreTimeObj, dateCurr.getHours(), gap);
    }

    // if we're on diff days, add gaps to totalTime
    if (!checkDatesEqual(datePrev, dateCurr)) {
      if (dailyTime > 0) {
        result.push({
          Date: datePrev,
          TotalTime: dailyTime,
        });
        dailyTime = 0;
      }
    }
    datePrev = dateCurr;
  }

  // to add the last entry
  if (dailyTime > 0) {
    result.push({
      Date: datePrev,
      TotalTime: dailyTime,
    });
  }

  // below is an array of most common hour(s) user used TikTok
  const coreTimeArray = getCoreTime(coreTimeObj);
  return [result, totalTime, coreTimeArray];
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

// this function makes the data for the watchtime (3rd) graph
function makeWatchtimeData(
  ogVidData: any,
  timeRange: number,
): [
  { Date: Date; GapLabel: string; GapLength: number }[],
  number,
  string[],
  any,
] {
  let totActivity = 0; // totActivity, in this case, will give total number of videos watched
  const result = [];
  let datePrev = new Date(ogVidData[0].Date);
  let timePrev = datePrev.getTime();

  // compute date you want to stop looping
  const dateToStop = new Date(
    +withoutTime(datePrev) - convertDaysToMs(timeRange - 1),
  );
  for (const entry of ogVidData) {
    const dateCurr = new Date(entry.Date);
    const timeCurr = dateCurr.getTime();

    // stop looping when you reach end selected range
    if (dateCurr < dateToStop) {
      break;
    }

    const gap = Number((timePrev - timeCurr) / 1000); // gives gap in secs
    if (gap < GAP_WATCHED) {
      totActivity += 1; // watchtime boxes fix (1): can change this to be "totActivity += gap / 60" to make boxes show time activity rather than number of vids watched
      result.push({
        Date: withoutTime(datePrev),
        GapLabel: gap >= 3 ? "min. 3 Sekunden" : "unter 3 Sekunden",
        GapLength: gap / 60, // might not need this... possibly should delete
      });
    }

    datePrev = dateCurr;
    timePrev = timeCurr;
  }

  const aggregates = {};
  let total = 0;

  result.forEach((x) => {
    const labelFixed = x.GapLabel.replace(".", "");
    const val = _.get(aggregates, labelFixed, 0);
    _.set(aggregates, labelFixed, val + 1);
    total += 1;
  });

  for (const k of Object.keys(aggregates)) {
    aggregates[k] /= total / 100;
  }

  return [result, totActivity, [], aggregates];
}

// for bars split into time slots
function makeTimeSlots(
  ogVidData: any,
  timeRange: number,
): [{ Date: Date; TimeOfDay: string; TotalTime: number }[], number, any, any] {
  let totalTime = 0;
  let totActivity = 0;
  const coreTimeObj = {};
  const result = [];

  let datePrev = new Date(ogVidData[0].Date);
  let timePrev = datePrev.getTime();
  let timeOfDayPrev = getTimeOfDay(datePrev.getHours());

  // compute date you want to stop looping
  const dateToStop = new Date(
    +withoutTime(datePrev) - convertDaysToMs(timeRange - 1),
  );
  for (const entry of ogVidData) {
    const dateCurr = new Date(entry.Date);

    // stop looping when you reach end selected range
    if (dateCurr < dateToStop) {
      break;
    }

    const timeCurr = dateCurr.getTime();
    const timeOfDayCurr = getTimeOfDay(dateCurr.getHours());

    const gap = Number((timePrev - timeCurr) / 1000 / 60);
    if (gap * 60 < GAP_WATCHED) {
      totalTime += gap;
      totActivity += gap;
      coreTime(coreTimeObj, dateCurr.getHours(), gap);
    }
    // if we're on the diff days or diff times of day, add gaps to totalTime
    if (
      !checkDatesEqual(datePrev, dateCurr) ||
      !(timeOfDayPrev === timeOfDayCurr)
    ) {
      if (totalTime > 0) {
        result.push({
          Date: withoutTime(datePrev),
          TimeOfDay: timeOfDayPrev,
          TotalTime: totalTime,
        });
      }
      totalTime = 0;
    }

    datePrev = dateCurr;
    timePrev = timeCurr;
    timeOfDayPrev = timeOfDayCurr;
  }

  // to add the last entry
  if (totalTime > 0) {
    result.push({
      Date: withoutTime(datePrev),
      TimeOfDay: timeOfDayPrev,
      TotalTime: totalTime,
    });
  }

  const aggregates = {};
  let total = 0;

  result.forEach((x) => {
    const val = _.get(aggregates, x.TimeOfDay, 0);
    _.set(aggregates, x.TimeOfDay, val + x.TotalTime);
    total += x.TotalTime;
  });

  for (const k of Object.keys(aggregates)) {
    aggregates[k] /= total / 100;
  }

  console.log(result);

  return [result, totActivity, [], aggregates];
}

// helper function to compute the total number of times the user opened TikTok
function getNumAppOpen(ogLoginData: any, timeRange: number) {
  // It can happen that there is no login data in the dump.
  // This implausible but it's on TikToks end.
  if (!ogLoginData) return "-";

  let total = 0;
  let datePrev = new Date(ogLoginData[0].Date.replace(" UTC", ""));

  // compute date you want to stop looping
  const dateToStop = new Date(
    +withoutTime(datePrev) - convertDaysToMs(timeRange - 1),
  );

  for (const entry of ogLoginData) {
    const dateCurr = new Date(entry.Date.replace(" UTC", ""));

    // stop looping when you reach end selected range
    if (dateCurr < dateToStop) {
      break;
    }

    // prevent counting repeated login entries
    if (!(datePrev === dateCurr)) {
      total += 1;
    }
    datePrev = dateCurr;
  }
  return `${total}x`;
}

// converts times to hours + mins if the times are over 60 mins, input is in mins
function convertTime(tot: number, graph: string) {
  if (graph === "skipped") return `${formatNumber(tot)} Videos`; // watchtime boxes fix (2): delete this line of code
  if (tot < 60) return `${Math.round(tot)}m`;
  const mins = tot % 60;
  const hrs = Math.floor(tot / 60);

  return `${hrs}h ${Math.round(mins)}m`;
}

export const arrangeDataVizOne = (
  dump: any,
  graph: "timeslots" | "skipped" | "default",
  timeRange: number,
): [
  string,
  string,
  string,
  any,
  // TODO: create type
  (
    | {
        Date: Date;
        TotalTime: number;
      }[]
    | {
        Date: Date;
        GapLabel: string;
        GapLength: number;
      }[]
  ),
] => {
  let totActivity;
  let coreTimeArray;
  let result;
  let aggregates;

  // The browsing history is not always ordered.
  const ogVidData = _.orderBy(
    dump.Activity["Video Browsing History"].VideoList,
    "Date",
    "desc",
  );
  const ogLoginData = dump.Activity["Login History"].LoginHistoryList;

  if (graph === "timeslots") {
    [result, totActivity, coreTimeArray, aggregates] = makeTimeSlots(
      ogVidData,
      timeRange,
    );
  } else if (graph === "skipped") {
    [result, totActivity, coreTimeArray, aggregates] = makeWatchtimeData(
      ogVidData,
      timeRange,
    );
  } else if (graph === "default") {
    [result, totActivity, coreTimeArray] = addTimeOfDay(ogVidData, timeRange);
  } else {
    throw new Error("Invalid graph");
  }
  const avgMinsPerDay = totActivity / timeRange;
  const numAppOpen = getNumAppOpen(ogLoginData, timeRange);
  let headValue =
    coreTimeArray.length > 1 ? `${coreTimeArray}` : `${coreTimeArray[0]}`;

  if (aggregates) headValue = aggregates;

  // make totActivity & avgMinsPerDay into hour if > 60 mins
  const totActivityString = convertTime(totActivity, graph);
  const avgMinsPerDayString = convertTime(
    // graph === "skipped" ? avgMinsPerDay : avgMinsPerDay,
    graph === "skipped" ? Math.round(avgMinsPerDay) : avgMinsPerDay,
    graph,
  );
  return [
    totActivityString,
    avgMinsPerDayString,
    numAppOpen,
    headValue,
    result,
  ];
};

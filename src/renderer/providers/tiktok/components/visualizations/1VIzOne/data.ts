import * as d3 from "d3";
import _ from "lodash";

// 10 minutes between videos is acceptable
const GAP_WATCHED = 10 * 60;

//  modify login data to facilitate checking for whether a new login was made
function makeLoginObj(array) {
  const obj = {};
  for (const loginEntry of array) {
    // extract date (without time)
    // console.log(loginEntry);
    const dateTime = new Date(loginEntry.Date.replace(" UTC", ""));
    const dateNoTime = withoutTime(dateTime);

    // check if date is already a key, add date (w/out time) as a key and the entire loginEntry (with time) as a value
    if (dateNoTime in obj) {
      obj[dateNoTime].push(dateTime);
    } else {
      obj[dateNoTime] = [];
      obj[dateNoTime].push(dateTime);
    }
  }
  return obj;
}

const formatNumber = (number: number) => {
  return Math.round(number).toLocaleString("de-DE");
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

// helper for checking whether a new login was made, returns true if new login was made
// remove login check (1): delete this entire function
function checkForLogin(loginObj: any, date_prev: Date, date_curr: Date) {
  const dateNoTime = withoutTime(date_prev);
  const timeArray = loginObj[dateNoTime.toString()];
  for (const loginTime of timeArray) {
    if (loginTime < date_prev && loginTime > date_curr) return true;
  }
  return false;
}

// for single-color bars
function addTimeOfDay(
  ogVidData: any,
  timeRange: number,
  loginObj: any,
): [{ Date: Date; TotalTime: number }[], number, string[]] {
  let dailyTime = 0;
  let totalTime = 0;
  const coreTimeObj = {};
  const result = [];

  let datePrev = new Date(ogVidData[0].Date);
  let timePrev = datePrev.getTime();

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
    timePrev = timeCurr;
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
  loginObj: any,
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
        GapLabel: gap > 2 ? "über 2 Sekunden" : "unter 2 Sekunden",
        GapLength: gap / 60, // might not need this... possibly should delete
      });
    }

    datePrev = dateCurr;
    timePrev = timeCurr;
  }

  const aggregates = {};
  let total = 0;

  result.forEach((x) => {
    const val = _.get(aggregates, x.GapLabel, 0);
    _.set(aggregates, x.GapLabel, val + 1);
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
  loginObj: any,
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

  return [result, totActivity, [], aggregates];
}

// helper function to compute the total number of times the user
// opened TikTok
function getNumAppOpen(ogLoginData: any, timeRange: number) {
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
  return total;
}

// converts times to hours + mins if the times are over 60 mins, input is in mins
function convertTime(tot: number, graph: string) {
  if (graph === "watchtime") return `${formatNumber(tot)} Videos`; // watchtime boxes fix (2): delete this line of code
  if (tot < 60) return `${Math.round(tot)}m`;
  const mins = tot % 60;
  const hrs = Math.floor(tot / 60);

  return `${hrs}h ${Math.round(mins)}m`;
}

export const arrangeDataVizOne = (
  dump: any,
  graph: "timeslots" | "watchtime" | "default",
  timeRange: number,
): [
  string,
  string,
  number,
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

  const ogVidData = dump.Activity["Video Browsing History"].VideoList;
  const ogLoginData = dump.Activity["Login History"].LoginHistoryList;

  const loginObj = makeLoginObj(ogLoginData);

  if (graph === "timeslots") {
    [result, totActivity, coreTimeArray, aggregates] = makeTimeSlots(
      ogVidData,
      timeRange,
      loginObj,
    );
  } else if (graph === "watchtime") {
    [result, totActivity, coreTimeArray, aggregates] = makeWatchtimeData(
      ogVidData,
      timeRange,
      loginObj,
    );
  } else if (graph === "default") {
    [result, totActivity, coreTimeArray] = addTimeOfDay(
      ogVidData,
      timeRange,
      loginObj,
    );
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
    // graph === "watchtime" ? avgMinsPerDay : avgMinsPerDay,
    graph === "watchtime" ? Math.round(avgMinsPerDay) : avgMinsPerDay,
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

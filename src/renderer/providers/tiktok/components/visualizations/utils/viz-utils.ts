import * as d3 from "d3";
import _ from "lodash";

/**
 *  This function uses the JSON data to return an array of objects that are in the following form:
 *  * If user selects to have bars broken up into time slots:
 * const videoData = [{
 *                      Date: *date object*,
 *                      TotalTime: *total time user spent on TikTok; Number*,
 *                      TimeOfDay: *Morgens, Mittag, Abends, or Nachts; string*
 *                    },
 *                    ...
 *                    ];
 *
 *  * else:
 * const videoData = [{
 *                      Date: *date object without time*,
 *                      TotalTime: *total time user spent on TikTok; Number*,
 *                    },
 *                    ...
 *                    ];
 * @returns
 */

export function getDayOfWeek(d: Date) {
  let day;
  switch (d.getDay()) {
    case 0:
      day = "So";
      break;
    case 1:
      day = "Mo";
      break;
    case 2:
      day = "Di";
      break;
    case 3:
      day = "Mi";
      break;
    case 4:
      day = "Do";
      break;
    case 5:
      day = "Fr";
      break;
    case 6:
      day = "Sa";
      break;
    default:
      break;
  }
  return day;
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
  let totalTime = 0;
  let totActivity = 0;
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

    // stop looping when you reach end of 7, 30, or 90 days
    if (dateCurr < dateToStop) {
      break;
    }

    const timeCurr = dateCurr.getTime();

    const gap = Number((timePrev - timeCurr) / (1000 * 60)); // gives gap in minutes
    // if gap < 5 mins or no new login was made, add gap between watched video time stamps
    if (gap < 5 || !checkForLogin(loginObj, datePrev, dateCurr)) {
      // remove login check (2): ^^^ delete "|| !checkForLogin(loginObj, date_prev, date_curr)"
      totalTime += gap;
      totActivity += gap;
      coreTime(coreTimeObj, dateCurr.getHours(), gap);
    }

    // if we're on diff days, add gaps to totalTime
    if (!checkDatesEqual(datePrev, dateCurr)) {
      result.push({
        Date: datePrev,
        TotalTime: totalTime,
      });
      totalTime = 0;
    }
    datePrev = dateCurr;
    timePrev = timeCurr;
  }

  // to add the last entry
  result.push({
    Date: datePrev,
    TotalTime: totalTime,
  });

  // below is an array of most common hour(s) user used TikTok
  const coreTimeArray = getCoreTime(coreTimeObj);
  return [result, totActivity, coreTimeArray];
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
    const timeCurr = dateCurr.getTime();

    // stop looping when you reach end of 7, 30, or 90 days
    if (dateCurr < dateToStop) {
      break;
    }

    // coreTime(coreTimeObj, date_curr.getHours());
    const gap = Number((timePrev - timeCurr) / 1000); // gives gap in secs
    // if gap between videos < 5 mins or no new login was made, add gap to total, to coreTime calculation, && add data entry to array
    if (gap < 300 || !checkForLogin(loginObj, datePrev, dateCurr)) {
      // remove login check (3): ^^^ delete "|| !checkForLogin(loginObj, date_prev, date_curr)"
      totActivity += 1; // watchtime boxes fix (1): can change this to be "totActivity += gap / 60" to make boxes show time activity rather than number of vids watched
      coreTime(coreTimeObj, dateCurr.getHours(), gap);
      result.push({
        Date: withoutTime(datePrev),
        GapLabel: gap > 2 ? "über 2 Sekunden" : "unter 2 Sekunden",
        GapLength: gap / 60, // might not need this... possibly should delete
      });
    }

    datePrev = dateCurr;
    timePrev = timeCurr;
  }

  // below is an array of most common hours user used TikTok
  const coreTimeArray = getCoreTime(coreTimeObj);

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

  return [result, totActivity, coreTimeArray, aggregates];
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

    // stop looping when you reach end of 7, 30, or 90 days
    if (dateCurr < dateToStop) {
      break;
    }

    const timeCurr = dateCurr.getTime();
    const timeOfDayCurr = getTimeOfDay(dateCurr.getHours());

    const gap = Number((timePrev - timeCurr) / (1000 * 60)); // gives gap in minutes
    // if gap < 5 mins or no new login was made
    if (gap < 5 || !checkForLogin(loginObj, datePrev, dateCurr)) {
      // remove login check (4): ^^^ delete "|| !checkForLogin(loginObj, date_prev, date_curr)"
      totalTime += gap;
      totActivity += gap;
      coreTime(coreTimeObj, dateCurr.getHours(), gap);
    }
    // if we're on the diff days or diff times of day, add gaps to totalTime
    if (
      !checkDatesEqual(datePrev, dateCurr) ||
      !(timeOfDayPrev === timeOfDayCurr)
    ) {
      result.push({
        Date: withoutTime(datePrev),
        TimeOfDay: timeOfDayPrev,
        TotalTime: totalTime,
      });
      totalTime = 0;
    }

    datePrev = dateCurr;
    timePrev = timeCurr;
    timeOfDayPrev = timeOfDayCurr;
  }

  // to add the last entry
  result.push({
    Date: withoutTime(datePrev),
    TimeOfDay: timeOfDayPrev,
    TotalTime: totalTime,
  });

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

    // stop looping when you reach end of 7, 30, or 90 days
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

// TODO: create typeOfGraph type
// converts times to hours + mins if the times are over 60 mins, input is in mins
function convertTime(tot: number, typeOfGraph: string) {
  if (typeOfGraph === "watchtime") return `${formatNumber(tot)} Videos`; // watchtime boxes fix (2): delete this line of code
  if (tot < 60) return `${Math.round(tot)}m`;
  const mins = tot % 60;
  const hrs = Math.floor(tot / 60);

  return `${hrs}h ${Math.round(mins)}m`;
}

export const arrangeDataVizOne = (
  typeOfGraph: string,
  timeRange: number,
  ogVidData: any,
  ogLoginData: any,
  loginObj: any,
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

  if (typeOfGraph === "timeslots") {
    [result, totActivity, coreTimeArray, aggregates] = makeTimeSlots(
      ogVidData,
      timeRange,
      loginObj,
    );
  } else if (typeOfGraph === "watchtime") {
    [result, totActivity, coreTimeArray, aggregates] = makeWatchtimeData(
      ogVidData,
      timeRange,
      loginObj,
    );
  } else if (typeOfGraph === "default") {
    [result, totActivity, coreTimeArray] = addTimeOfDay(
      ogVidData,
      timeRange,
      loginObj,
    );
  } else {
    throw new Error("Invalid typeOfGraph");
  }
  const avgMinsPerDay = totActivity / timeRange;
  const numAppOpen = getNumAppOpen(ogLoginData, timeRange);
  let headValue =
    coreTimeArray.length > 1 ? `${coreTimeArray}` : `${coreTimeArray[0]}`;

  if (aggregates) headValue = aggregates;

  // make totActivity & avgMinsPerDay into hour if > 60 mins
  const totActivityString = convertTime(totActivity, typeOfGraph);
  const avgMinsPerDayString = convertTime(
    // typeOfGraph === "watchtime" ? avgMinsPerDay : avgMinsPerDay,
    typeOfGraph === "watchtime" ? Math.round(avgMinsPerDay) : avgMinsPerDay,
    typeOfGraph,
  );
  return [
    totActivityString,
    avgMinsPerDayString,
    numAppOpen,
    headValue,
    result,
  ];
};

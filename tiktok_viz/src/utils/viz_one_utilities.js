import * as d3 from "d3";

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

export function getDayOfWeek(d) {
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
  }
  return day;
}

// helper function to check if dates are equal
const checkDatesEqual = (date1, date2) =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

// helper function for finding core time
function coreTime(coreTimeObj, hour, gap) {
  hour in coreTimeObj ? (coreTimeObj[hour] += gap) : (coreTimeObj[hour] = gap);
  return coreTimeObj;
}

// helper function for converting days to ms
export function convertDaysToMs(days) {
  return days * 24 * 60 * 60 * 1000;
}

// helper function for getting core time(s), an array is returned
function getCoreTime(coreTimeObj) {
  const vals = Object.values(coreTimeObj);
  const max = d3.max(vals);
  return Object.keys(coreTimeObj).filter((key) => coreTimeObj[key] === max);
}

// helper for checking whether a new login was made, returns true if new login was made
// remove login check (1): delete this entire function
function checkForLogin(loginObj, date_prev, date_curr) {
  let dateNoTime = withoutTime(date_prev);
  let timeArray = loginObj[dateNoTime];
  for (let loginTime of timeArray) {
    if (loginTime < date_prev && loginTime > date_curr) return true;
  }
  return false;
}

// for single-color bars
function addTimeOfDay(ogVidData, timeRange, loginObj) {
  let totalTime = 0;
  let totActivity = 0;
  let coreTimeObj = {};
  let result = [];

  let date_prev = new Date(ogVidData[0].Date);
  let time_prev = date_prev.getTime();

  // compute date you want to stop looping
  const dateToStop = new Date(
    withoutTime(date_prev) - convertDaysToMs(timeRange - 1)
  );

  for (let entry of ogVidData) {
    const date_curr = new Date(entry.Date);

    // stop looping when you reach end of 7, 30, or 90 days
    if (date_curr < dateToStop) {
      break;
    }

    const time_curr = date_curr.getTime();

    let gap = Number((time_prev - time_curr) / (1000 * 60)); // gives gap in minutes
    // if gap < 5 mins or no new login was made, add gap between watched video time stamps
    if (gap < 5 || !checkForLogin(loginObj, date_prev, date_curr)) {
      // remove login check (2): ^^^ delete "|| !checkForLogin(loginObj, date_prev, date_curr)"
      totalTime += gap;
      totActivity += gap;
      coreTime(coreTimeObj, date_curr.getHours(), gap);
    }

    // if we're on diff days, add gaps to totalTime
    if (!checkDatesEqual(date_prev, date_curr)) {
      result.push({
        Date: date_prev,
        TotalTime: totalTime,
      });
      totalTime = 0;
    }
    date_prev = date_curr;
    time_prev = time_curr;
  }

  // to add the last entry
  result.push({
    Date: date_prev,
    TotalTime: totalTime,
  });

  // below is an array of most common hour(s) user used TikTok
  const coreTimeArray = getCoreTime(coreTimeObj);
  return [result, totActivity, coreTimeArray];
}

// helper function for getting time of day
function getTimeOfDay(entryHour) {
  let timeOfDay = "";
  if (entryHour >= 6 && entryHour < 12) {
    timeOfDay = "Morgens";
  } else if (entryHour >= 12 && entryHour < 18) {
    timeOfDay = "Mittags";
  } else if (entryHour >= 18 && entryHour < 22) {
    timeOfDay = "Abends";
  } else if (entryHour >= 22 || entryHour < 6) {
    timeOfDay = "Nachts";
  }

  return timeOfDay;
}

// helper function for stripping Date objects of time
export function withoutTime(dateObj) {
  return new Date(dateObj.toDateString());
}

// this function makes the data for the watchtime (3rd) graph
function makeWatchtimeData(ogVidData, timeRange, loginObj) {
  let totActivity = 0; // totActivity, in this case, will give total number of videos watched
  let coreTimeObj = {};
  let result = [];
  let date_prev = new Date(ogVidData[0].Date);
  let time_prev = date_prev.getTime();

  // compute date you want to stop looping
  const dateToStop = new Date(
    withoutTime(date_prev) - convertDaysToMs(timeRange - 1)
  );
  for (let entry of ogVidData) {
    let date_curr = new Date(entry.Date);
    let time_curr = date_curr.getTime();

    // stop looping when you reach end of 7, 30, or 90 days
    if (date_curr < dateToStop) {
      break;
    }

    // coreTime(coreTimeObj, date_curr.getHours());
    let gap = Number((time_prev - time_curr) / 1000); // gives gap in secs
    // if gap between videos < 5 mins or no new login was made, add gap to total, to coreTime calculation, && add data entry to array
    if (gap < 300 || !checkForLogin(loginObj, date_prev, date_curr)) {
      // remove login check (3): ^^^ delete "|| !checkForLogin(loginObj, date_prev, date_curr)"
      totActivity += gap / 60; // watchtime boxes fix (1): can change this to be "totActivity += gap / 60" to make boxes show time activity rather than number of vids watched
      coreTime(coreTimeObj, date_curr.getHours(), gap);
      result.push({
        Date: withoutTime(date_prev),
        GapLabel: gap > 2 ? "over 2 secs" : "under 2 secs",
        GapLength: gap / 60, // might not need this... possibly should delete
      });
    }

    date_prev = date_curr;
    time_prev = time_curr;
  }

  // below is an array of most common hours user used TikTok
  const coreTimeArray = getCoreTime(coreTimeObj);
  return [result, totActivity, coreTimeArray];
}

// for bars split into time slots
function makeTimeSlots(ogVidData, timeRange, loginObj) {
  let totalTime = 0;
  let totActivity = 0;
  let coreTimeObj = {};
  let result = [];

  let date_prev = new Date(ogVidData[0].Date);
  let time_prev = date_prev.getTime();
  let timeOfDay_prev = getTimeOfDay(date_prev.getHours());

  // compute date you want to stop looping
  const dateToStop = new Date(
    withoutTime(date_prev) - convertDaysToMs(timeRange - 1)
  );
  for (let entry of ogVidData) {
    const date_curr = new Date(entry.Date);

    // stop looping when you reach end of 7, 30, or 90 days
    if (date_curr < dateToStop) {
      break;
    }

    const time_curr = date_curr.getTime();
    const timeOfDay_curr = getTimeOfDay(date_curr.getHours());

    let gap = Number((time_prev - time_curr) / (1000 * 60)); // gives gap in minutes
    // if gap < 5 mins or no new login was made
    if (gap < 5 || !checkForLogin(loginObj, date_prev, date_curr)) {
      // remove login check (4): ^^^ delete "|| !checkForLogin(loginObj, date_prev, date_curr)"
      totalTime += gap;
      totActivity += gap;
      coreTime(coreTimeObj, date_curr.getHours(), gap);
    }
    // if we're on the diff days or diff times of day, add gaps to totalTime
    if (
      !checkDatesEqual(date_prev, date_curr) ||
      !(timeOfDay_prev === timeOfDay_curr)
    ) {
      result.push({
        Date: withoutTime(date_prev),
        TimeOfDay: timeOfDay_prev,
        TotalTime: totalTime,
      });
      totalTime = 0;
    }

    date_prev = date_curr;
    time_prev = time_curr;
    timeOfDay_prev = timeOfDay_curr;
  }

  // to add the last entry
  result.push({
    Date: withoutTime(date_prev),
    TimeOfDay: timeOfDay_prev,
    TotalTime: totalTime,
  });

  // below is an array of most common hours user used TikTok
  const coreTimeArray = getCoreTime(coreTimeObj);
  return [result, totActivity, coreTimeArray];
}

// helper function to compute the total number of times the user
// opened TikTok
function getNumAppOpen(ogLoginData, timeRange) {
  let total = 0;
  let date_prev = new Date(ogLoginData[0].Date.replace(" UTC", ""));

  // compute date you want to stop looping
  const dateToStop = new Date(
    withoutTime(date_prev) - convertDaysToMs(timeRange - 1)
  );

  for (let entry of ogLoginData) {
    let date_curr = new Date(entry.Date.replace(" UTC", ""));

    // stop looping when you reach end of 7, 30, or 90 days
    if (date_curr < dateToStop) {
      break;
    }

    // prevent counting repeated login entries
    if (!(date_prev === date_curr)) {
      total++;
    }
    date_prev = date_curr;
  }
  return total;
}

// converts times to hours + mins if the times are over 60 mins, input is in mins
function convertTime(tot, typeOfGraph) {
  // if (typeOfGraph === "watchtime") return `${tot} vids`; // watchtime boxes fix (2): delete this line of code
  if (tot < 60) return `${tot.toFixed(0)}m`;
  const mins = tot % 60;
  const hrs = Math.floor(tot / 60);

  return `${hrs}h ${mins.toFixed(0)}m`;
}

export function arrangeDataVizOne(
  typeOfGraph,
  timeRange,
  ogVidData,
  ogLoginData,
  loginObj
) {
  let totActivity;
  let coreTimeArray;
  let result;

  if (typeOfGraph === "timeslots") {
    [result, totActivity, coreTimeArray] = makeTimeSlots(
      ogVidData,
      timeRange,
      loginObj
    );
  } else if (typeOfGraph === "watchtime") {
    [result, totActivity, coreTimeArray] = makeWatchtimeData(
      ogVidData,
      timeRange,
      loginObj
    );
  } else if (typeOfGraph === "default") {
    [result, totActivity, coreTimeArray] = addTimeOfDay(
      ogVidData,
      timeRange,
      loginObj
    );
  }
  let avgMinsPerDay = totActivity / timeRange;
  const numAppOpen = getNumAppOpen(ogLoginData, timeRange);
  const coreTimeString =
    coreTimeArray.length > 1 ? `${coreTimeArray}` : `${coreTimeArray[0]}`;

  // make totActivity & avgMinsPerDay into hour if > 60 mins
  totActivity = convertTime(totActivity, typeOfGraph);
  avgMinsPerDay = convertTime(
    typeOfGraph === "watchtime" ? avgMinsPerDay.toFixed(1) : avgMinsPerDay,
    typeOfGraph
  );
  return [totActivity, avgMinsPerDay, numAppOpen, coreTimeString, result];
}

/**
 * Below are functions that calculate statistics about video gap length and percentage of time where <= 2 videos were watched.
 * The former statistics include: the average gap length, the average gap length per day, the percentage of gaps < 6 seconds, " " < 5 mins, " " < 10 mins
 * @param {*} data000
 * @returns
 */

// helper function --- general average
// function makeArrayBreakTimesGen(data) {
//   let time_prev = null;
//   let breakTimes = [];

//   for (let entry of data) {
//     // get date
//     let time_curr = new Date(entry.Date).getTime();

//     // if there is a previous date, subtract prev by current
//     if (time_prev) {
//       const breakTime = Number((time_prev - time_curr) / (1000 * 60));
//       breakTimes.push(breakTime);
//     }
//     time_prev = time_curr;
//   }
//   // find average of array
//   const average = d3.mean(breakTimes);
//   // console.log(breakTimes);
//   return [average, breakTimes];
// }

// // helper function --- average per day
// function makeArrayAvgPerDay(data) {
//   let time_prev = null;
//   let date_prev = null;
//   let breakTimesOneDay = [];
//   let breakTimesAvgAll = [];

//   for (let entry of data) {
//     // get date
//     let date_curr = new Date(entry.Date);
//     let time_curr = date_curr.getTime();

//     // if there is a previous date, subtract prev by current
//     if (time_prev && date_prev) {
//       if (checkDatesEqual(date_curr, date_prev)) {
//         const breakTime = Number((time_prev - time_curr) / (1000 * 60));
//         breakTimesOneDay.push(breakTime);
//       } else {
//         let avgPerDay = d3.mean(breakTimesOneDay);
//         breakTimesAvgAll.push(avgPerDay);

//         // reset break times one day
//         breakTimesOneDay = [];
//       }
//     }
//     date_prev = date_curr;
//     time_prev = time_curr;
//   }
//   // console.log(`avg per day ${breakTimesAvgAll}`);

//   return d3.mean(breakTimesAvgAll);
// }

// export function breakFrequency() {
//   const data = data000.Activity["Video Browsing History"].VideoList;
//   const [average, breakTimes] = makeArrayBreakTimesGen(data);

//   const averagePerDay = makeArrayAvgPerDay(data);

//   //get length of breakTimes
//   const breakArrayLength = breakTimes.length;

//   // count how many values < 5, < 10, < 2 there are and
//   const percent2 =
//     (breakTimes.filter((time) => time > 0.1).length / breakArrayLength) * 100;

//   const percent5 =
//     (breakTimes.filter((time) => time > 5).length / breakArrayLength) * 100;
//   const percent10 =
//     (breakTimes.filter((time) => time > 10).length / breakArrayLength) * 100;

//   return [
//     average.toFixed(2),
//     averagePerDay.toFixed(2),
//     percent2.toFixed(2),
//     percent5.toFixed(2),
//     percent10.toFixed(2),
//   ];
// }

// export function twoOrLessVids() {
//   const data = data000.Activity["Video Browsing History"].VideoList;
//   let countVids2OrLess = 0;
//   let countVidsPerDay = 0;
//   let numOfDays = 0;
//   let date_prev = null;
//   for (let entry of data) {
//     let date_curr = new Date(entry.Date);
//     if (date_prev && checkDatesEqual(date_curr, date_prev)) {
//       countVidsPerDay++;
//     } else {
//       if (countVidsPerDay <= 2) {
//         countVids2OrLess++;
//       }
//       numOfDays++;
//     }
//     date_prev = date_curr;
//   }

//   const percent = (countVids2OrLess / numOfDays) * 100;
//   // loop all entries
//   // if date is the same as prev date, add 1 to count
//   // reset count after date is no longer the same
//   // store count in array
//   // find average of array
//   // count how many instances of 2,1,0 there were
//   // print count
//   return percent.toFixed(2);
// }

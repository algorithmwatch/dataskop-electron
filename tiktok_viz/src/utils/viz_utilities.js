import React from "react";
import ReactDOM from "react-dom";
import data000 from "../data/000-peter.json";
import biggestData from "../data/001_redacted.json";
import small from "../data/small_modified_peter.json";
import med from "../data/med_modified_peter.json";
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
 *                      Date: *date object*,
 *                      TotalTime: *total time user spent on TikTok; Number*,
 *                    },
 *                    ...
 *                    ];
 * @returns
 */

// helper function to check if dates are equal
const checkDatesEqual = (date1, date2) =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

// helper function for finding core time
function coreTime(coreTimeObj, hour) {
  hour in coreTimeObj ? (coreTimeObj[hour] += 1) : (coreTimeObj[hour] = 1);
  return coreTimeObj;
}

// helper function for getiing core time, an array is returned
function getCoreTime(coreTimeObj) {
  const vals = Object.values(coreTimeObj);
  const max = d3.max(vals);
  return Object.keys(coreTimeObj).filter((key) => coreTimeObj[key] === max);
}

// for single-color bars
function addTimeOfDay(ogVidData, time_prev, totalTime, timeRange) {
  let result = [];
  let totActivity = 0;
  let coreTimeObj = {};
  let date_prev = new Date(ogVidData[0].Date);
  console.log("hi");

  // compute date you want to stop looping
  const dateToStop = new Date(withoutTime(date_prev) - timeRange);
  console.log(dateToStop);
  for (let vidEntry of ogVidData) {
    const date_curr = new Date(vidEntry.Date);

    // stop looping when you reach end of 7, 30, or 90 days
    if (date_curr < dateToStop) {
      break;
    }
    const time_curr = date_curr.getTime();
    coreTime(coreTimeObj, date_curr.getHours());
    if (time_prev) {
      if (checkDatesEqual(date_prev, date_curr)) {
        let gap = Number((time_prev - time_curr) / (1000 * 60)); // gap in minutes
        // if gap < 5 mins or gap > 5 mins and no new log in was made
        // console.log(gap);
        if (gap < 5) {
          // || (gap > 2 && !checkNewLogin(date_prev, date_curr))) {
          totalTime += gap;
          totActivity += gap;
        }
      } else {
        result.push({
          Date: date_prev,
          TotalTime: totalTime,
        });
        totalTime = 0;
      }
    }
    date_prev = date_curr;
    time_prev = time_curr;
  }

  // to add the last entry
  result.push({
    Date: date_prev,
    TotalTime: totalTime,
  });

  // below is an array of most common hours user used TikTok
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
  } else if (entryHour < 22) {
    timeOfDay = "Abends";
  } else {
    timeOfDay = "Nachts";
  }

  return timeOfDay;
}

// helper function for stripping Date objects of time
function withoutTime(dateObj) {
  return new Date(dateObj.toDateString());
}

// for bars split into time slots
function addTimeSlots(
  ogVidData,
  time_prev,
  timeOfDay_prev,
  totalTime,
  timeRange
) {
  let result = [];
  let totActivity = 0;
  let coreTimeObj = {};
  let date_prev = new Date(ogVidData[0].Date);
  // compute date you want to stop looping
  const dateToStop = new Date(withoutTime(date_prev) - timeRange);
  for (let vidEntry of ogVidData) {
    const date_curr = new Date(vidEntry.Date);

    // stop looping when you reach end of 7, 30, or 90 days
    if (date_curr < dateToStop) {
      break;
    }

    const time_curr = date_curr.getTime();
    const entryHrCurr = date_curr.getHours();
    const timeOfDay_curr = getTimeOfDay(entryHrCurr);
    coreTime(coreTimeObj, entryHrCurr);
    if (date_prev && time_prev && timeOfDay_prev) {
      if (
        checkDatesEqual(date_prev, date_curr) &&
        timeOfDay_prev === timeOfDay_curr
      ) {
        // console.log(timeOfDay_curr, timeOfDay_prev);
        let gap = Number((time_prev - time_curr) / (1000 * 60)); // gives gap in minutes
        // if gap < 5 mins or gap > 5 mins and no new log in was made
        // console.log(gap);
        if (gap < 5) {
          // || (gap > 2 && !checkNewLogin(date_prev, date_curr))) {
          totalTime += gap;
          totActivity += gap;
        }
      } else {
        // console.log(totalTime);
        result.push({
          Date: withoutTime(date_prev),
          TimeOfDay: timeOfDay_prev,
          TotalTime: totalTime,
        });
        totalTime = 0;
      }
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
  let date_prev = new Date(ogLoginData[0].Date);

  // compute date you want to stop looping
  const dateToStop = new Date(withoutTime(date_prev) - timeRange);
  for (let entry of ogLoginData) {
    let date_curr = new Date(entry.Date);

    // stop looping when you reach end of 7, 30, or 90 days
    if (date_curr < dateToStop) {
      break;
    }

    // prevent counting repeated log in entries
    if (!(date_prev === date_curr)) {
      total++;
    }
    date_prev = date_curr;
  }
  return total;
}

export function arrangeDataVizOne(timeSlots, timeRange) {
  // If we want to show bars that break up days into different time slots
  // let date_prev = null;
  let time_prev = null;
  let totalTime = 0;
  let timeOfDay_prev = null;
  let ogVidData = biggestData.Activity["Video Browsing History"].VideoList;
  const ogLoginData = biggestData.Activity["Login History"].LoginHistoryList;
  let data;
  let totActivity; // let hi = 'hi';
  let coreTimeArray;

  if (timeSlots) {
    [data, totActivity, coreTimeArray] = addTimeSlots(
      ogVidData,
      time_prev,
      timeOfDay_prev,
      totalTime,
      timeRange
    );
    // const selectedDays = 60; // this will be a user input
    // const avgMinsPerDay = totActivity / selectedDays;
    // // console.log(data);
    // return [totActivity, avgMinsPerDay, numAppOpen, data];
  } else {
    [data, totActivity, coreTimeArray] = addTimeOfDay(
      ogVidData,
      time_prev,
      totalTime,
      timeRange
    );
  }
  console.log(coreTimeArray);
  const selectedDays = timeRange / (1000 * 3600 * 24); // this will be a user input
  const avgMinsPerDay = totActivity / selectedDays;
  const numAppOpen = getNumAppOpen(ogLoginData, timeRange);
  const coreTimeString =
    coreTimeArray.length > 1 ? `${coreTimeArray}` : `${coreTimeArray[0]}`;
  console.log(data);
  return [
    totActivity.toFixed(0),
    avgMinsPerDay.toFixed(0),
    numAppOpen,
    coreTimeString,
    data,
  ];
  // console.log(videoData);
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

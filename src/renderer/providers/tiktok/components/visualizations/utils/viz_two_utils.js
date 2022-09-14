import React from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { withoutTime, convertDaysToMs } from "./viz-utils";

// let numOfTopItems = 5;
// helper for setting up hashtag data
function buildHashtagArray(urlInfo, hashtags, hashtagsAll) {
  const vidTagsInfo = urlInfo.HashtagInfo;
  if (vidTagsInfo.length !== 0) {
    // loop through all hashtags and collect them in an object
    for (const tagInfo of vidTagsInfo) {
      const tagName = tagInfo.title.toLowerCase();
      // ignore "fyp"s
      if (
        tagName.indexOf("fyp") !== -1 ||
        tagName.indexOf("fy") !== -1 ||
        tagName.indexOf("stitch") !== -1 ||
        tagName.indexOf("foryou") !== -1 ||
        tagName.indexOf("foryoupage") !== -1 ||
        tagName.indexOf("fürdich") !== -1 ||
        tagName.indexOf("trending") !== -1 ||
        tagName.indexOf("viral") !== -1
      )
        continue;
      tagName in hashtags ? (hashtags[tagName] += 1) : (hashtags[tagName] = 1);
      tagName in hashtagsAll
        ? (hashtagsAll[tagName] += 1)
        : (hashtagsAll[tagName] = 1);
    }
  }
}
// helper for setting up sound data
function buildSoundArray(urlInfo, sounds, soundsAll) {
  if (
    // url.meta !== undefined &&
    // url.meta.results !== undefined &&
    !urlInfo.SoundOriginal
  ) {
    const soundTitle = urlInfo.SoundTitle;
    soundTitle in sounds ? (sounds[soundTitle] += 1) : (sounds[soundTitle] = 1);
    soundTitle in soundsAll
      ? (soundsAll[soundTitle] += 1)
      : (soundsAll[soundTitle] = 1);
  }
}
// helper for setting up diversification labels
function buildDiversificationLabelsArray(urlInfo, divlabels, divlabelsAll) {
  if (
    // url.meta !== undefined &&
    // url.meta.results !== undefined &&
    urlInfo.DiversificationLabels !== undefined
  ) {
    const labels = urlInfo.DiversificationLabels;
    for (const label of labels) {
      if (label === "Others") continue;
      label in divlabels ? (divlabels[label] += 1) : (divlabels[label] = 1);
      label in divlabelsAll
        ? (divlabelsAll[label] += 1)
        : (divlabelsAll[label] = 1);
    }
  }
}

// helper function that gets the top (X) entries with the highest counts, numOfTopItems can be an input by user
function getTop(i, obj, array, numOfTopItems, date_start, lastDayOfTick) {
  // topItem = getHighestItem(topItem, i, obj);
  const dotRadius = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  for (let i = 0; i < numOfTopItems; i++) {
    const counts = Object.values(obj);
    // get top item
    const maxVal = d3.max(counts);
    const itemNames = Object.keys(obj).filter((key) => obj[key] === maxVal);
    // add entry to data array
    // itemNames.length > 1
    // ?
    itemNames.forEach((itemName) => {
      array.push({
        DateStart: date_start,
        // DateEnd: lastDayOfTick,
        Name: itemName,
        Count: maxVal,
        Num: dotRadius[i],
      });
      delete obj[itemNames];
    });
    if (Object.keys(obj).length === 0) break;
  }
  // return topItem;
}
// helper for extracting keys of obj by max count values
// function findTopItemsInObj(obj, maxCount) {
//   let arrayOfTopItems = [];
//   for (let item of Object.keys(obj)) {
//     if (obj[item] === maxCount) {
//       arrayOfTopItems.push(item);
//     }
//   }
//   return arrayOfTopItems;
// }
// helper for getting the top hashtag, sound, and div label
function getTopOverallItems(obj) {
  const maxCount = d3.max(Object.values(obj));
  const topItemNames = Object.keys(obj).filter((key) => obj[key] === maxCount);
  // findTopItemsInObj(obj, maxCount);
  //
  return topItemNames;
}

// tickLength will be the range of time contained per tick (i.e. 7 days, 30 days, 90 days)
export function getTopData(
  numOfTopItems,
  tickLength,
  timeRange,
  metadata,
  gdprVidData,
) {
  // empty objects of items to keep counts of them
  let hashtags = {};
  let sounds = {};
  let divlabels = {};
  // empty objects of each item to keep counts of them for entire range of graph
  const hashtagsAll = {};
  const soundsAll = {};
  const divlabelsAll = {};
  // empty objects of top items for a week
  // let topHashtag = {};
  // let topSound = {};
  // let topDivLabel = {};
  // empty arrays that will be fed into observable plot
  const hashtagData = [];
  const soundData = [];
  const diverseLabelData = [];
  // const vidData = .Activity["Video Browsing History"].VideoList;
  let date_start = withoutTime(new Date(gdprVidData[0].Date));
  const dateToStop = new Date(
    withoutTime(date_start) - convertDaysToMs(timeRange - 1),
  );
  let lastDayOfTick = new Date(
    withoutTime(date_start) - convertDaysToMs(tickLength - 1),
  );
  let i = 0;
  // loop through all video data
  for (const vid of gdprVidData) {
    const date_curr = withoutTime(new Date(vid.Date));
    // stop looping when you reach end of [timeRange] days
    if (date_curr < dateToStop) {
      break;
    }
    if (date_curr < lastDayOfTick) {
      getTop(
        i,
        hashtags,
        hashtagData,
        numOfTopItems,
        date_start,
        lastDayOfTick,
      );
      getTop(i, sounds, soundData, numOfTopItems, date_start, lastDayOfTick);
      getTop(
        i,
        divlabels,
        diverseLabelData,
        numOfTopItems,
        date_start,
        lastDayOfTick,
      );
      // reset everything
      date_start = date_curr;
      lastDayOfTick = new Date(
        withoutTime(date_start) - convertDaysToMs(tickLength - 1),
      );
      // reset objects
      hashtags = {};
      sounds = {};
      divlabels = {};
      // console.log("empty objs", hashtags, sounds, divlabels);
      i++;
    } else {
      const vidUrl = vid.VideoLink;
      // find vid url within scraped data
      // console.log(metadata[vidUrl]);
      const urlInfo = metadata[vidUrl];
      if (urlInfo === undefined) continue;
      buildHashtagArray(urlInfo, hashtags, hashtagsAll);
      buildSoundArray(urlInfo, sounds, soundsAll);
      buildDiversificationLabelsArray(urlInfo, divlabels, divlabelsAll);
    }
  }
  // console.log("all hashtags", hashtagsAll);
  const topHashtag = getTopOverallItems(hashtagsAll);
  const topSound = getTopOverallItems(soundsAll);
  const topDivLabel = getTopOverallItems(divlabelsAll);
  // let topHashtag;
  // let topSound;
  // let topDivLabel;
  return [
    hashtagData,
    soundData,
    diverseLabelData,
    topHashtag,
    topSound,
    topDivLabel,
  ];
}

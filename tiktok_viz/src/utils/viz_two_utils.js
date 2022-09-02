import React from "react";
import ReactDOM from "react-dom";
// import peterScrapedData from "../data/videometa.json";
// import data000 from "../data/000-peter.json";
import { withoutTime, convertDaysToMs } from "./viz_one_utilities";
import * as d3 from "d3";

// let numOfTopItems = 5;

// helper for setting up hashtag data
function buildHashtagArray(urlInfo, hashtags) {
  let vidTagsInfo = urlInfo.HashtagInfo;
  if (vidTagsInfo.length !== 0) {
    // loop through all hashtags and collect them in an object
    for (let tagInfo of vidTagsInfo) {
      let tagName = tagInfo.title.toLowerCase();

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
    }
  }
}

// helper for setting up sound data
function buildSoundArray(urlInfo, sounds) {
  if (
    // url.meta !== undefined &&
    // url.meta.results !== undefined &&
    !urlInfo.SoundOriginal
  ) {
    let soundTitle = urlInfo.SoundTitle;
    soundTitle in sounds ? (sounds[soundTitle] += 1) : (sounds[soundTitle] = 1);
  }
}

// helper for setting up diversification labels
function buildDiversificationLabelsArray(urlInfo, divlabels) {
  if (
    // url.meta !== undefined &&
    // url.meta.results !== undefined &&
    urlInfo.DiversificationLabels !== undefined
  ) {
    let labels = urlInfo.DiversificationLabels;

    for (let label of labels) {
      if (label === "Others") continue;
      // if (label === "Science") console.log("Science");
      label in divlabels ? (divlabels[label] += 1) : (divlabels[label] = 1);
    }
  }
}

// helper for getting ultimate top item
function getHighestItem(topItem, i, obj) {
  let maxCount = d3.max(Object.values(obj));
  if (i === 0 || maxCount > Object.values(topItem)[0]) {
    let topItemNames = Object.keys(obj).filter((key) => obj[key] === maxCount);
    // reset topItem object
    let tempTopItem = {};
    topItemNames.forEach((topName) => {
      tempTopItem[topName] = maxCount;
    });
    // console.log(tempTopItem);
    return tempTopItem;
  }
  return topItem;
}

// helper function that gets the top (X) entries with the highest counts, numOfTopItems can be an input by user
function getTop(
  i,
  obj,
  array,
  topItem,
  numOfTopItems,
  date_start,
  lastDayOfTick
) {
  topItem = getHighestItem(topItem, i, obj);
  const dotRadius = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  for (let i = 0; i < numOfTopItems; i++) {
    let counts = Object.values(obj);
    // get top item
    let maxVal = d3.max(counts);

    let itemNames = Object.keys(obj).filter((key) => obj[key] === maxVal);

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
  return topItem;
}

// helper for reseting objects
// function reset(hashtags, sounds, divlabels) {

// }

// tickLength will be the range of time contained per tick (i.e. 7 days, 30 days, 90 days)
export function getTopData(
  numOfTopItems,
  tickLength,
  timeRange,
  metadata,
  gdprVidData
) {
  // create empty object of hashtags to keep counts of them
  let hashtags = {};
  let sounds = {};
  let divlabels = {};

  let topHashtag = {};
  let topSound = {};
  let topDivLabel = {};

  let hashtagData = [];
  let soundData = [];
  let diverseLabelData = [];

  // const vidData = .Activity["Video Browsing History"].VideoList;
  let date_start = withoutTime(new Date(gdprVidData[0].Date));
  const dateToStop = new Date(
    withoutTime(date_start) - convertDaysToMs(timeRange - 1)
  );

  let lastDayOfTick = new Date(
    withoutTime(date_start) - convertDaysToMs(tickLength - 1)
  );

  let i = 0;

  // loop through all video data
  for (let vid of gdprVidData) {
    let date_curr = withoutTime(new Date(vid.Date));
    // stop looping when you reach end of [timeRange] days
    if (date_curr < dateToStop) {
      break;
    }

    if (date_curr < lastDayOfTick) {
      console.log(hashtags);
      topHashtag = getTop(
        i,
        hashtags,
        hashtagData,
        topHashtag,
        numOfTopItems,
        date_start,
        lastDayOfTick
      );

      topSound = getTop(
        i,
        sounds,
        soundData,
        topSound,
        numOfTopItems,
        date_start,
        lastDayOfTick
      );

      topDivLabel = getTop(
        i,
        divlabels,
        diverseLabelData,
        topDivLabel,
        numOfTopItems,
        date_start,
        lastDayOfTick
      );

      // reset everything
      date_start = date_curr;
      lastDayOfTick = new Date(
        withoutTime(date_start) - convertDaysToMs(tickLength - 1)
      );

      // reset objects
      hashtags = {};
      sounds = {};
      divlabels = {};
      // console.log("empty objs", hashtags, sounds, divlabels);
      i++;
    } else {
      let vidUrl = vid.VideoLink;

      // find vid url within scraped data
      // console.log(metadata[vidUrl]);
      let urlInfo = metadata[vidUrl];

      if (urlInfo === undefined) continue;
      buildHashtagArray(urlInfo, hashtags);
      buildSoundArray(urlInfo, sounds);
      buildDiversificationLabelsArray(urlInfo, divlabels);
    }
  }

  return [
    hashtagData,
    soundData,
    diverseLabelData,
    topHashtag,
    topSound,
    topDivLabel,
  ];
}

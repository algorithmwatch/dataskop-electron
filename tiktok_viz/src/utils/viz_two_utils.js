import React from "react";
import ReactDOM from "react-dom";
import peterScrapedData from "../data/videometa.json";
import data000 from "../data/000-peter.json";
import { withoutTime, convertDaysToMs } from "./viz_one_utilities";
import * as d3 from "d3";

// let numOfTopItems = 5;

// helper for setting up hashtag data
function buildHashtagArray(url, hashtags) {
  if (url.meta !== undefined && url.meta.results !== undefined) {
    let vidTagsInfo = url.meta.results.challenges;
    // loop through all hashtags and collect them in an object
    for (let tagInfo of vidTagsInfo) {
      let tagName = tagInfo.title.toLowerCase();

      // igonore "fyp"s
      if (
        tagName.indexOf("fyp") !== -1 ||
        tagName.indexOf("fy") !== -1 ||
        tagName.indexOf("stitch") !== -1 ||
        tagName.indexOf("foryou") !== -1 ||
        tagName.indexOf("viral") !== -1
      )
        continue;
      // console.log(tagName);
      tagName in hashtags ? (hashtags[tagName] += 1) : (hashtags[tagName] = 1);
    }
  }
}

// helper for setting up sound data
function buildSoundArray(url, sounds) {
  if (
    url.meta !== undefined &&
    url.meta.results !== undefined &&
    !url.meta.results.music.original
  ) {
    let soundTitle = url.meta.results.music.title;
    soundTitle in sounds ? (sounds[soundTitle] += 1) : (sounds[soundTitle] = 1);
  }
}

// helper for setting up diversification labels
function buildDiversificationLabelsArray(url, divlabels) {
  if (
    url.meta !== undefined &&
    url.meta.results !== undefined &&
    url.meta.results.diversificationLabels !== undefined
  ) {
    // console.log(url.meta.results.diversificationLabels);
    let labels = url.meta.results.diversificationLabels;

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
        DateEnd: lastDayOfTick,
        Name: itemName,
        Count: maxVal,
        Num: dotRadius[i],
      });
      delete obj[itemNames];
    });
  }
  return topItem;
}

// helper for reseting objects
function reset(hashtags, sounds, divlabels) {
  hashtags = {};
  sounds = {};
  divlabels = {};
}

// tickLength will be the range of time contained per tick (i.e. 7 days, 30 days, 90 days)
export function getTopData(numOfTopItems, tickLength, timeRange) {
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

  const vidData = data000.Activity["Video Browsing History"].VideoList;
  let date_start = withoutTime(new Date(vidData[0].Date));
  const dateToStop = new Date(
    withoutTime(date_start) - convertDaysToMs(timeRange - 1)
  );

  let lastDayOfTick = new Date(
    withoutTime(date_start) - convertDaysToMs(tickLength - 1)
  );

  let i = 0;
  // loop through all video data
  for (let vid of vidData) {
    let date_curr = withoutTime(new Date(vid.Date));
    // stop looping when you reach end of [timeRange] days
    if (date_curr < dateToStop) {
      break;
    }

    if (date_curr < lastDayOfTick) {
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
      reset(hashtags, sounds, divlabels);
      i++;
    } else {
      let vidUrl = vid.VideoLink;

      // find vid url within scraped data
      let url = peterScrapedData[vidUrl];
      if (url === undefined) continue;

      buildHashtagArray(url, hashtags);
      buildSoundArray(url, sounds);
      buildDiversificationLabelsArray(url, divlabels);
    }
  }
  // console.log(diverseLabelData);
  return [
    hashtagData,
    soundData,
    diverseLabelData,
    topHashtag,
    topSound,
    topDivLabel,
  ];
}

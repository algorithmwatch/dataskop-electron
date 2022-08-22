import React from "react";
import ReactDOM from "react-dom";
import peterScrapedData from "../data/videometa.json";
import data000 from "../data/000-peter.json";
import { withoutTime, convertDaysToMs } from "./viz_one_utilities";

let numOfTopItems = 5;

// helper for setting up hashtag data
function buildHashtagArray(url, hashtags) {
  if (url.meta !== undefined && url.meta.results !== undefined) {
    let vidTagsInfo = url.meta.results.challenges;
    // loop through all hashtags and collect them in an object
    for (let tagInfo of vidTagsInfo) {
      let tagName = tagInfo.title.toLowerCase();

      // igonore "fyp"s
      if (tagName.indexOf("fyp") !== -1 || tagName.indexOf("stitch") !== -1)
        continue;
      // console.log(tagName);
      tagName in hashtags ? (hashtags[tagName] += 1) : (hashtags[tagName] = 1);
    }
  }
}

// helper for setting up sound data
function buildSoundArray(url, sounds) {
  if (url.meta !== undefined && url.meta.results !== undefined) {
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
      label in divlabels ? (divlabels[label] += 1) : (divlabels[label] = 1);
    }
  }
}

// helper function that gets the top (X) entries with the highest counts, numOfTopItems can be an input by user
function getTop(obj, array, numOfTopItems, date_start, lastDayOfTick) {
  const sortedVals = Object.values(obj).sort((first, second) => {
    return second - first;
  });
  sortedVals.splice(0, numOfTopItems);
  for (let val of sortedVals) {
    let itemNames = Object.keys(obj).filter((key) => obj[key] === val);

    itemNames.forEach((itemName) =>
      array.push({
        DateStart: date_start,
        DateEnd: lastDayOfTick,
        Name: itemName,
        Count: val,
      })
    );
  }
}

// helper for reseting objects
function reset(hashtags, sounds, divlabels) {
  hashtags = {};
  sounds = {};
  divlabels = {};
}

// tickLength will be the range of time contained per tick (i.e. 7 days, 30 days, 90 days)
export function getTopData(tickLength, timeRange) {
  // create empty object of hashtags to keep counts of them
  let hashtags = {};
  let sounds = {};
  let divlabels = {};

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

  // loop through all video data
  for (let vid of vidData) {
    let date_curr = withoutTime(new Date(vid.Date));
    // stop looping when you reach end of [timeRange] days
    if (date_curr < dateToStop) {
      break;
    }

    if (date_curr < lastDayOfTick) {
      getTop(hashtags, hashtagData, numOfTopItems, date_start, lastDayOfTick);
      // addTopToArray(hashtagData);

      getTop(sounds, soundData, numOfTopItems, date_start, lastDayOfTick);
      // addTopToArray(soundData);

      getTop(
        divlabels,
        diverseLabelData,
        numOfTopItems,
        date_start,
        lastDayOfTick
      );
      // addTopToArray(diverseLabelData);

      // reset everything
      date_start = lastDayOfTick;
      lastDayOfTick = new Date(
        withoutTime(date_start) - convertDaysToMs(tickLength - 1)
      );
      reset(hashtags, sounds, divlabels);
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
  console.log(hashtagData);
  return [hashtagData, soundData, diverseLabelData];
}

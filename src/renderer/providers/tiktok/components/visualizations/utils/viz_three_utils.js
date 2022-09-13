import React from "react";
import ReactDOM from "react-dom";
import { withoutTime } from "./viz_one_utilities";

export default function getTopHashtags(peterScrapedData) {
  // create empty object that will contain author details (avatar link and account name)
  const authorDeets = {};
  // loop through all urls of watched videos
  for (const url of peterScrapedData) {
    const authorName = url.meta.results.author;
    // loop through all hashtags and collect them in an object
    for (const tagInfo of vidTagsInfo) {
      const tagName = tagInfo.title;
      tagName in hashtags ? (hashtags[tagName] += 1) : (hashtags[tagName] = 1);
    }
  }

  return hashtags;
}

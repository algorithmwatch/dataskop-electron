import { withoutTime } from "./viz_one_utilities";

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

export function shortenGdprData(data) {
  // for viz 1 & 2
  const videodata = data.Activity["Video Browsing History"].VideoList;
  const logindata = data.Activity["Login History"].LoginHistoryList;
  const tiktokLiveVids = data["Tiktok Live"]["Watch Live History"].WatchLiveMap;

  // for viz 3
  const likedVids = data.Activity["Like List"].ItemFavoriteList;
  const sharedVids = data.Activity["Share History"].ShareHistoryList;
  const savedVids = data.Activity["Favorite Videos"].FavoriteVideoList;

  // For viz 1: modify login data to facilitate checking for whether a new login was made
  const loginObj = makeLoginObj(logindata);

  return [
    videodata,
    logindata,
    loginObj,
    tiktokLiveVids,
    likedVids,
    sharedVids,
    savedVids,
  ];
}

export function shortenMetadata(data) {
  const result = {};
  for (const url of Object.keys(data)) {
    if (data[url].meta !== undefined && data[url].meta.results !== undefined) {
      result[url] = {
        Desc: data[url].meta.results.desc,
        CreateTime: data[url].meta.results.createTime,
        Duration: data[url].meta.results.video.duration,
        Author: data[url].meta.results.author,
        SoundTitle: data[url].meta.results.music.title,
        SoundOriginal: data[url].meta.results.music.original,
        SoundAuthor: data[url].meta.results.music.authorName,
        SoundId: data[url].meta.results.music.id,
        HashtagInfo: data[url].meta.results.challenges,
        Stats: data[url].meta.results.stats,
        DiversificationLabels: data[url].meta.results.diversificationLabels,
        AuthorThumbnail: data[url].meta.results.avatarThumb,
      };
    }
  }
  // data = data.map((url) => ());

  return result;
}

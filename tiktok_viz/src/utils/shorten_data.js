export function shortenGdprData(data) {
  // for viz 1 & 2
  let videodata = data.Activity["Video Browsing History"].VideoList;
  let logindata = data.Activity["Login History"].LoginHistoryList;
  let tiktokLiveVids = data["Tiktok Live"]["Watch Live History"].WatchLiveMap;

  // for viz 3
  let likedVids = data.Activity["Like List"].ItemFavoriteList;
  let sharedVids = data.Activity["Share History"].ShareHistoryList;
  let savedVids = data.Activity["Favorite Videos"].FavoriteVideoList;

  return [
    videodata,
    logindata,
    tiktokLiveVids,
    likedVids,
    sharedVids,
    savedVids,
  ];
}

export function shortenMetadata(data) {
  data = data.map((url) => ({
    url: url,
    desc: url.meta.results.desc,
    createTime: url.meta.results.createTime,
    duration: url.meta.results.video.duration,
    author: url.meta.results.author,
    soundTitle: url.meta.results.music.title,
    soundAuthor: url.meta.results.music.authorName,
    soundId: url.meta.results.music.id,
    hashtagInfo: url.meta.results.challenges,
    stats: url.meta.results.stats,
    diversificationLabels: url.meta.results.diversificationLabels,
    authorThumbnail: url.meta.results.avatarThumb,
  }));

  return data;
  // data.map((entry) => {Date: withoutTime(entry.Date), Length: })
}

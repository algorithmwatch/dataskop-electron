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
  let result = {};
  for (let url of Object.keys(data)) {
    // console.log(url);
    if (data.url === undefined || data.url.meta === undefined) continue;
    result.url = {
      desc: data.url.meta.results.desc,
      createTime: data.url.meta.results.createTime,
      duration: data.url.meta.results.video.duration,
      author: data.url.meta.results.author,
      soundTitle: data.url.meta.results.music.title,
      soundAuthor: data.url.meta.results.music.authorName,
      soundId: data.url.meta.results.music.id,
      hashtagInfo: data.url.meta.results.challenges,
      stats: data.url.meta.results.stats,
      diversificationLabels: data.url.meta.results.diversificationLabels,
      authorThumbnail: data.url.meta.results.avatarThumb,
    };
  }
  //data = data.map((url) => ());

  return result;
  // data.map((entry) => {Date: withoutTime(entry.Date), Length: })
}

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
    console.log(typeof url);

    if (
      data[url]["meta"] !== undefined &&
      data[url]["meta"]["results"] !== undefined
    ) {
      result[url] = {
        Desc: data[url]["meta"]["results"]["desc"],
        CreateTime: data[url]["meta"]["results"]["createTime"],
        Duration: data[url]["meta"]["results"]["video"]["duration"],
        Author: data[url]["meta"]["results"]["author"],
        SoundTitle: data[url]["meta"]["results"]["music"]["title"],
        SoundOriginal: data[url]["meta"]["results"]["music"]["original"],
        SoundAuthor: data[url]["meta"]["results"]["music"]["authorName"],
        SoundId: data[url]["meta"]["results"]["music"]["id"],
        HashtagInfo: data[url]["meta"]["results"]["challenges"],
        Stats: data[url]["meta"]["results"]["stats"],
        DiversificationLabels:
          data[url]["meta"]["results"]["diversificationLabels"],
        AuthorThumbnail: data[url]["meta"]["results"]["avatarThumb"],
      };
    }
  }
  //data = data.map((url) => ());

  return result;
  // data.map((entry) => {Date: withoutTime(entry.Date), Length: })
}

export function shortenGdprData(data) {
  // for viz 1 & 2
  let videodata = data.Activity["Video Browsing History"].VideoList;
  let logindata = data.Activity["Login History"].LoginHistoryList;
  let tiktokLiveVids =
    data.Activity["Tiktok Live"]["Watch Live History"].WatchLiveMap;

  // for viz 3
  let likedVids = data.Activity["Like List"].ItemFavoriteList;
  let sharedVids = data.Activity["Share History"].ShareHistoryList;
  let savedVids = data.Activity["Favorite Videos"].FavoriteVideoList;
}

export function shortenMetadata(data) {}

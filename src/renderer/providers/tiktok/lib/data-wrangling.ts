import _ from "lodash";

const prependTiktokSuffix = (id: string | number): string => `tv${id}`;

const idToTiktokUrl = (id: string) =>
  `https://www.tiktok.com/@user/video/${id.slice(2)}/`;

const getIdFromUrl = (url: string): string => url.match(/\/(\d*)\/$/)[1];

const getWatchedVideos = (dump: any) =>
  dump.Activity["Video Browsing History"].VideoList;

const getLookupIdsFromDump = (videoList: any[]) => {
  const videoUrls = videoList.map((x) => x.VideoLink);
  const videoIds = _.uniq(videoUrls).map(getIdFromUrl).map(prependTiktokSuffix);
  return videoIds;
};

const getMostRecentWatchVideos = (dump: any, max: number) => {
  // get last N * 2 videos before making them unique by id
  const videos = getWatchedVideos(dump).slice(-max * 2);
  const lookupIds = getLookupIdsFromDump(videos);
  return _.uniq(lookupIds).slice(-max);
};

export { getMostRecentWatchVideos };
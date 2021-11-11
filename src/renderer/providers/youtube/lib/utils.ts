import _ from 'lodash';
import { Lookup, ScrapingResultSaved } from 'renderer/db';

const filterLookupBySession = (
  results: ScrapingResultSaved[],
  lookups: Lookup[],
) => {
  const videoIds = new Set();

  results.forEach((x) => {
    if ('slug' in x && x.slug === 'yt-user-watch-history') {
      x.fields.videos.forEach(({ id }: { id: any }) => videoIds.add(id));
    }
  });
  return lookups.filter((x) => videoIds.has(x.info.videoId));
};

const redactWatchHistory = (
  results: ScrapingResultSaved[],
  lookups: Lookup[],
) => {
  // - private videos are not in lookups (cause they have no meta infos)
  // - videos that are not unlisted are public
  // - safe the amount of videos before redaction + number of unlisted videos
  const publicVideos = new Set(
    lookups
      .filter((x) => !x.info.unlisted)
      .map(({ info: { videoId } }) => videoId),
  );

  const unlistedVideos = new Set(
    lookups
      .filter((x) => x.info.unlisted)
      .map(({ info: { videoId } }) => videoId),
  );

  results.forEach((x) => {
    if ('slug' in x && x.slug === 'yt-user-watch-history') {
      x.fields.numVideosBeforeRedaction = x.fields.videos.length;

      x.fields.videos = x.fields.videos.filter((video: any) =>
        publicVideos.has(video.id),
      );

      x.fields.numVideosRedactedUnlisted = x.fields.videos.filter(
        (video: any) => unlistedVideos.has(video.id),
      ).length;
    }
  });

  return results;
};

// data wrangling

const groupByFollowId = (x: any[]) =>
  Object.values(_.groupBy(x, (y) => y.fields.followId));

const getVideos = (data: any[]) =>
  data.filter((x) => x.slug && x.slug.includes('video-page') && x.success);

const getFollowGroups = (data: any[]) =>
  groupByFollowId(data.filter((x) => x.slug && x.slug.includes('video-page')));

export {
  filterLookupBySession,
  redactWatchHistory,
  getFollowGroups,
  getVideos,
};

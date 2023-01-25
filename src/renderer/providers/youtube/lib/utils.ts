import _ from "lodash";
import { LookupMap, ScrapingResultSaved } from "renderer/lib/db";

const filterLookupBySession = (
  results: ScrapingResultSaved[],
  lookups: LookupMap,
) => {
  const videoIds: string[] = [];

  results.forEach((x) => {
    if ("slug" in x && x.slug === "yt-user-watch-history") {
      x.fields.videos.forEach(({ id }: { id: any }) => videoIds.push(id));
    }
  });
  return _.pick(lookups, videoIds);
};

const redactWatchHistory = (
  results: ScrapingResultSaved[],
  lookups: LookupMap,
) => {
  // - private videos are not in lookups (cause they have no meta infos)
  // - videos that are not unlisted are public
  // - safe the amount of videos before redaction + number of unlisted videos

  const publicVideos = new Set(
    _.filter(
      lookups,
      (x) => x.provider == "youtube" && !x.data.unlisted,
    ).keys(),
  );

  const unlistedVideos = new Set(
    _.filter(lookups, (x) => x.provider == "youtube" && x.data.unlisted).keys(),
  );

  results.forEach((x) => {
    if ("slug" in x && x.slug === "yt-user-watch-history") {
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
  data.filter((x) => x.slug && x.slug.includes("video-page") && x.success);

const getFollowGroups = (data: any[]) =>
  groupByFollowId(data.filter((x) => x.slug && x.slug.includes("video-page")));

export {
  filterLookupBySession,
  redactWatchHistory,
  getFollowGroups,
  getVideos,
};

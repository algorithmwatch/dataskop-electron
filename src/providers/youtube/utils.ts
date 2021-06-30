import _ from 'lodash';

const getThumbnails = (id: string) => {
  /**
   * Returns all thumbnails to given YT video it.
    https://yt-thumb.canbeuseful.com/en
   */

  // the first image is the `default` image.
  const small = [1, 2, 3].map(
    (x) => `https://img.youtube.com/vi/${id}/${x}.jpg`,
  );

  small.unshift(`https://img.youtube.com/vi/${id}/default.jpg`);

  const defaultImage = {
    mq: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
    hq: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    sd: `https://img.youtube.com/vi/${id}/sddefault.jpg`,
    maxRes: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
  };

  return { small, default: defaultImage };
};

const getVideoUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

// data wrangling

const groupByFollowId = (x: any[]) =>
  Object.values(_.groupBy(x, (y) => y.fields.followId));

const getVideos = (data: any[]) =>
  data.filter((x) => x.slug && x.slug.includes('video-page') && x.success);

const getFollowGroups = (data: any[]) =>
  groupByFollowId(data.filter((x) => x.slug && x.slug.includes('video-page')));

export { getThumbnails, getVideoUrl, getFollowGroups, getVideos };

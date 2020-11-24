/* eslint-disable no-continue */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */

// taken from
// https://github.com/SuspiciousLookingOwl/scrape-yt/blob/master/src/common/parser.ts

import cheerio from 'cheerio';
import {
  Video,
  VideoDetailed,
  Playlist,
  PlaylistDetailed,
  Channel,
  SearchOptions,
  HistorySearch,
  HistoryVideo,
  HistoryComment,
  Subscription,
} from './types';

/**
 * Get duration in seconds
 *
 * @param s String timestamp
 */
const getDuration = (s: string): number => {
  const sMod = s.replace(/:/g, '.');
  const spl = sMod.split('.');
  if (spl.length === 0) return +spl;

  const sumStr = spl.pop();
  if (sumStr !== undefined) {
    let sum = +sumStr;
    if (spl.length === 1) sum += +spl[0] * 60;
    if (spl.length === 2) {
      sum += +spl[1] * 60;
      sum += +spl[0] * 3600;
    }
    return sum;
  }
  return 0;
};

/**
 * Scrape search result from passed HTML
 *
 * @param html HTML
 * @param options Search options
 */
function parseSearch(
  html: string,
  options: SearchOptions
): (Video | Playlist | Channel)[] {
  const results = [];
  const $ = cheerio.load(html);

  $('.yt-lockup').each((i: number, v: CheerioElement) => {
    if (results.length >= options.limit!) return false;

    const $result = $(v);

    const id = $result.find('a.yt-uix-tile-link').attr('href');
    if (id === undefined || id.startsWith('https://www.googleadservices.com'))
      return true; // Ignoring non video

    let result;

    if (options.type === 'video') {
      result = {
        id: id.replace('/watch?v=', ''),
        title: $result.find('.yt-lockup-title a').text(),
        duration:
          getDuration($result.find('.video-time').text().trim()) || null,
        thumbnail:
          $result.find('.yt-thumb-simple img').attr('data-thumb') ||
          $result.find('.yt-thumb-simple img').attr('src'),
        channel: {
          id: $result.find('.yt-lockup-byline a').attr('href')!.split('/')[2],
          name: $result.find('.yt-lockup-byline a').text() || null,
          url:
            `https://www.youtube.com${$result
              .find('.yt-lockup-byline a')
              .attr('href')}` || null,
        } as Channel,
        uploadDate: $result
          .find('.yt-lockup-meta-info li:first-of-type')
          .text(),
        viewCount: +$result
          .find('.yt-lockup-meta-info li:last-of-type')
          .text()
          .replace(/[^0-9]/g, ''),
        type: 'video',
      } as Video;
    } else if (options.type === 'playlist') {
      result = {
        id: id.split('&list=')[1],
        title: $result.find('.yt-lockup-title a').text(),
        thumbnail:
          $result.find('.yt-thumb-simple img').attr('data-thumb') ||
          $result.find('.yt-thumb-simple img').attr('src'),
        channel: {
          id: $result.find('.yt-lockup-byline a').attr('href')!.split('/')[2],
          name: $result.find('.yt-lockup-byline a').text() || null,
          url:
            `https://www.youtube.com${$result
              .find('.yt-lockup-byline a')
              .attr('href')}` || null,
        } as Channel,
        videoCount: +$result
          .find('.formatted-video-count-label b')
          .text()
          .replace(/[^0-9]/g, ''),
        type: 'playlist',
      } as Playlist;
    } else {
      result = {
        id: id.split('/')[2],
        name: $result.find('.yt-lockup-title a').text(),
        thumbnail: `https:${
          $result.find('.yt-thumb-simple img').attr('data-thumb') ||
          $result.find('.yt-thumb-simple img').attr('src')
        }`,
        videoCount: +$result
          .find('.yt-lockup-meta-info li')
          .text()
          .replace(/[^0-9]/g, ''),
        url: `https://www.youtube.com${$result
          .find('a.yt-uix-tile-link')
          .attr('href')}`,
        type: 'channel',
      } as Channel;
    }

    results.push(result);
  });

  // Alternative
  if (results.length === 0) {
    let dataInfo = [];
    let scrapped = false;

    // Try to decode the data if it's still encoded
    try {
      let data = html
        .split("ytInitialData = JSON.parse('")[1]
        .split("');</script>")[0];
      data = data.replace(/\\x([0-9A-F]{2})/gi, function (...args) {
        return String.fromCharCode(parseInt(args[1], 16));
      });
      html = data;
    } catch (err) {}

    // Trying to scrap for each possible ways of how Youtube serve the data in JS ordered by most common possibility
    try {
      dataInfo = JSON.parse(
        html
          .split('{"itemSectionRenderer":{"contents":')
          [html.split('{"itemSectionRenderer":{"contents":').length - 1].split(
            ',"continuations":[{'
          )[0]
      );
      scrapped = true;
    } catch (err) {}
    if (!scrapped) {
      try {
        dataInfo = JSON.parse(
          html
            .split('{"itemSectionRenderer":')
            [html.split('{"itemSectionRenderer":').length - 1].split(
              '},{"continuationItemRenderer":{'
            )[0]
        ).contents;
        scrapped = true;
      } catch (err) {}
    }

    if (!scrapped) {
      return [];
    }

    for (let i = 0; i < dataInfo.length; i++) {
      let data = dataInfo[i];
      let result: Video | Playlist | Channel;
      let searchType = options.type;

      if (searchType === 'all') {
        if (data.videoRenderer !== undefined) searchType = 'video';
        else if (data.playlistRenderer !== undefined) searchType = 'playlist';
        else if (data.channelRenderer !== undefined) searchType = 'channel';
        else continue;
      }

      if (searchType === 'video') {
        data = data.videoRenderer;
        if (!data) continue;
        result = {
          id: data.videoId,
          title: data.title.runs[0].text,
          duration: data.lengthText
            ? getDuration(data.lengthText.simpleText)
            : null,
          thumbnail:
            data.thumbnail.thumbnails[data.thumbnail.thumbnails.length - 1].url,
          channel: {
            id:
              data.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
            name: data.ownerText.runs[0].text || null,
            url:
              `https://www.youtube.com${data.ownerText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl}` ||
              null,
          } as Channel,
          uploadDate: data.publishedTimeText
            ? data.publishedTimeText.simpleText
            : null,
          viewCount:
            data.viewCountText && data.viewCountText.simpleText
              ? +data.viewCountText.simpleText.replace(/[^0-9]/g, '')
              : null,
          type: 'video',
        } as Video;
      } else if (searchType === 'playlist') {
        data = data.playlistRenderer;
        if (!data) continue;
        result = {
          id: data.playlistId,
          title: data.title.simpleText,
          thumbnail:
            data.thumbnails[0].thumbnails[
              data.thumbnails[0].thumbnails.length - 1
            ].url,
          channel: {
            id:
              data.shortBylineText.runs[0].navigationEndpoint.browseEndpoint
                .browseId,
            name: data.shortBylineText.runs[0].text,
            url: `https://www.youtube.com${data.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
          } as Channel,
          videoCount: +data.videoCount.replace(/[^0-9]/g, ''),
          type: 'playlist',
        } as Playlist;
      } else {
        data = data.channelRenderer;
        if (!data) continue;
        result = {
          id: data.channelId,
          name: data.title.simpleText,
          thumbnail: `https:${
            data.thumbnail.thumbnails[data.thumbnail.thumbnails.length - 1].url
          }`,
          videoCount: data.videoCountText
            ? +data.videoCountText.runs[0].text.replace(/[^0-9]/g, '')
            : null,
          url: `https://www.youtube.com${data.navigationEndpoint.browseEndpoint.canonicalBaseUrl}`,
          type: 'channel',
        } as Channel;
      }

      if (results.length < options.limit!) results.push(result);
      else break;
    }
  }
  return results;
}

/**
 * Scrape playlist result from passed HTML
 *
 * @param html HTML
 */
function parseGetPlaylist(html: string): PlaylistDetailed | null {
  const $ = cheerio.load(html);
  let playlist: PlaylistDetailed;
  const videos: Video[] = [];

  $('.pl-video').each((i: number, v: CheerioElement) => {
    const $result = $(v);
    if ($result.find('.pl-video-owner a').attr('href') === undefined)
      return true; // Continue if deleted video
    const video = {
      id: $result.find('button').attr('data-video-ids'),
      title: $result
        .find('a.pl-video-title-link')
        .text()
        .replace(/\n/g, '')
        .trim(),
      duration: getDuration($result.find('.timestamp').text()) || null,
      thumbnail: $result.find('img').attr('data-thumb'),
      channel: {
        id: $result.find('.pl-video-owner a').attr('href')!.split('/')[2],
        name: $result.find('.pl-video-owner a').text(),
        url: `https://www.youtube.com${$result
          .find('.pl-video-owner a')
          .attr('href')}`,
      } as Channel,
    } as Video;
    videos.push(video);
  });

  if (videos.length > 0) {
    playlist = {
      id: $('#pl-header').attr('data-full-list-id'),
      title: $('.pl-header-title').text().trim(),
      videoCount: +$('.pl-header-details li')[
        $('.pl-header-details li').length - 3
      ].children[0].data!.replace(/[^0-9]/g, ''),
      viewCount: +$('.pl-header-details li')[
        $('.pl-header-details li').length - 2
      ].children[0].data!.replace(/[^0-9]/g, ''),
      lastUpdatedAt: $('.pl-header-details li')[
        $('.pl-header-details li').length - 1
      ].children[0].data,
      ...($('#appbar-nav a').attr('href') !== undefined && {
        channel: {
          id: $('#appbar-nav a').attr('href')!.split('/')[2],
          name: $('.appbar-nav-avatar').attr('title'),
          thumbnail: $('.appbar-nav-avatar').attr('src'),
          url: `https://www.youtube.com${$('#appbar-nav a').attr('href')}`,
        },
      }),
      videos: videos as Video[],
    } as PlaylistDetailed;
  } else {
    // Alternative
    let playlistVideoList = null;
    try {
      playlistVideoList = JSON.parse(
        `${
          html
            .split('{"playlistVideoListRenderer":{"contents":')[1]
            .split('}],"playlistId"')[0]
        }}]`
      );
    } catch (err) {
      // Playlist not found
      return {};
    }
    for (let i = 0; i < playlistVideoList.length; i++) {
      const videoInfo = playlistVideoList[i].playlistVideoRenderer;
      if (videoInfo == null || videoInfo.shortBylineText === undefined)
        continue; // Continue if deleted video

      const video = {
        id: videoInfo.videoId,
        title: videoInfo.title.runs
          ? videoInfo.title.runs[0].text
          : videoInfo.title.simpleText,
        duration: getDuration(videoInfo.lengthText.simpleText),
        thumbnail:
          videoInfo.thumbnail.thumbnails[
            videoInfo.thumbnail.thumbnails.length - 1
          ].url,
        channel: {
          id:
            videoInfo.shortBylineText.runs[0].navigationEndpoint.browseEndpoint
              .browseId,
          name: videoInfo.shortBylineText.runs[0].text,
          url: `https://www.youtube.com${videoInfo.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
        } as Channel,
      } as Video;

      videos.push(video);
    }

    const sidebarRenderer = JSON.parse(
      html.split('{"playlistSidebarRenderer":')[1].split('\n')[0].slice(0, -3)
    ).items;

    const primaryRenderer =
      sidebarRenderer[0].playlistSidebarPrimaryInfoRenderer;

    const videoOwner =
      sidebarRenderer[1]?.playlistSidebarSecondaryInfoRenderer.videoOwner ??
      undefined;

    let videoCount = 0;
    let viewCount = 0;
    let lastUpdatedAt = '';

    if (primaryRenderer.stats.length === 3) {
      videoCount = +primaryRenderer.stats[0]?.runs[0].text.replace(
        /[^0-9]/g,
        ''
      );
      viewCount = +primaryRenderer.stats[1].simpleText.replace(/[^0-9]/g, '');
      lastUpdatedAt =
        (primaryRenderer.stats[2].runs[1]?.text ??
          primaryRenderer.stats[2].simpleText) ||
        primaryRenderer.stats[2].runs[0].text;
    } else if (primaryRenderer.stats.length === 2) {
      videoCount = +primaryRenderer.stats[0]?.runs[0].text.replace(
        /[^0-9]/g,
        ''
      );
      lastUpdatedAt = primaryRenderer.stats[1].simpleText;
    }

    playlist = {
      id:
        primaryRenderer.title.runs[0].navigationEndpoint.watchEndpoint
          .playlistId,
      title: primaryRenderer.title.runs[0].text,
      videoCount,
      viewCount,
      lastUpdatedAt,
      ...(videoOwner !== undefined && {
        channel: {
          id:
            videoOwner.videoOwnerRenderer.title.runs[0].navigationEndpoint
              .browseEndpoint.browseId,
          name: videoOwner.videoOwnerRenderer.title.runs[0].text,
          thumbnail:
            videoOwner.videoOwnerRenderer.thumbnail.thumbnails[
              videoOwner.videoOwnerRenderer.thumbnail.thumbnails.length - 1
            ].url,
          url: `https://www.youtube.com${videoOwner.videoOwnerRenderer.title.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
        } as Channel,
      }),
      videos: videos as Video[],
    } as PlaylistDetailed;
  }
  return playlist;
}

/**
 * Scrape video result from passed HTML
 *
 * @param html HTML
 */
function parseGetVideo(html: string): VideoDetailed | null {
  try {
    const relatedPlayer = html
      .split("RELATED_PLAYER_ARGS': ")[1]
      .split("'BG_P'")[0]
      .split('\n')[0];
    const videoInfo = JSON.parse(
      JSON.parse(relatedPlayer.substring(0, relatedPlayer.length - 1))
        .watch_next_response
    ).contents.twoColumnWatchNextResults.results.results.contents[0]
      .itemSectionRenderer.contents[0].videoMetadataRenderer;
    const { videoDetails } = JSON.parse(
      JSON.parse(
        html
          .split('ytplayer.config = ')[1]
          .split(';ytplayer.load = function()')[0]
      ).args.player_response
    );

    const tags: string[] = [];
    let description = '';

    if (videoInfo.topStandaloneBadge !== undefined) {
      videoInfo.topStandaloneBadge.standaloneCollectionBadgeRenderer.label.runs.forEach(
        (tag: Record<string, string>) => {
          if (tag.text.trim()) tags.push(tag.text);
        }
      );
    }

    if (videoInfo.description !== undefined) {
      videoInfo.description.runs.forEach(
        (descriptionPart: Record<string, string>) => {
          description += descriptionPart.text;
        }
      );
    }

    const video = {
      id: videoInfo.videoId,
      title: videoInfo.title.runs[0].text,
      duration: +videoDetails.lengthSeconds || null,
      thumbnail:
        videoDetails.thumbnail.thumbnails[
          +videoDetails.thumbnail.thumbnails.length - 1
        ].url,
      description,
      channel: {
        id:
          videoInfo.owner.videoOwnerRenderer.title.runs[0].navigationEndpoint
            .browseEndpoint.browseId,
        name: videoInfo.owner.videoOwnerRenderer.title.runs[0].text,
        thumbnail: videoInfo.owner.videoOwnerRenderer.thumbnail.thumbnails[
          videoInfo.owner.videoOwnerRenderer.thumbnail.thumbnails.length - 1
        ].url.startsWith('https:')
          ? videoInfo.owner.videoOwnerRenderer.thumbnail.thumbnails[
              videoInfo.owner.videoOwnerRenderer.thumbnail.thumbnails.length - 1
            ].url
          : `https:${
              videoInfo.owner.videoOwnerRenderer.thumbnail.thumbnails[
                videoInfo.owner.videoOwnerRenderer.thumbnail.thumbnails.length -
                  1
              ].url
            }`,
        url: `https://www.youtube.com/channel/${videoInfo.owner.videoOwnerRenderer.title.runs[0].navigationEndpoint.browseEndpoint.browseId}`,
      } as Channel,
      uploadDate: videoInfo.dateText.simpleText,
      viewCount: +videoDetails.viewCount,
      likeCount:
        videoInfo.likeButton.likeButtonRenderer.likeCount !== undefined
          ? videoInfo.likeButton.likeButtonRenderer.likeCount
          : null,
      dislikeCount:
        videoInfo.likeButton.likeButtonRenderer.dislikeCount !== undefined
          ? videoInfo.likeButton.likeButtonRenderer.likeCount
          : null,
      isLiveContent: videoDetails.isLiveContent,
      tags,
    } as VideoDetailed;

    return video;
  } catch (err) {
    // Alternative

    let contents;

    try {
      contents = JSON.parse(
        html.split('window["ytInitialData"] = ')[1].split(';\n')[0]
      ).contents.twoColumnWatchNextResults.results.results.contents;
    } catch (err) {
      return null; // Video not found;
    }

    const secondaryInfo = contents[1].videoSecondaryInfoRenderer;
    const primaryInfo = contents[0].videoPrimaryInfoRenderer;
    const { videoDetails } = JSON.parse(
      html.split('window["ytInitialPlayerResponse"] = ')[1].split(';\n')[0]
    );
    const videoInfo = { ...secondaryInfo, ...primaryInfo, videoDetails };

    const tags: string[] = [];
    let description = '';

    if (videoInfo.superTitleLink !== undefined) {
      videoInfo.superTitleLink.runs.forEach((tag: Record<string, string>) => {
        if (tag.text.trim()) tags.push(tag.text);
      });
    }

    if (videoInfo.description !== undefined) {
      videoInfo.description.runs.forEach(
        (descriptionPart: Record<string, string>) => {
          description += descriptionPart.text;
        }
      );
    }

    const video = {
      id: videoInfo.videoDetails.videoId,
      title: videoInfo.title.runs[0].text,
      duration: +videoInfo.videoDetails.lengthSeconds || null,
      thumbnail:
        videoInfo.videoDetails.thumbnail.thumbnails[
          videoInfo.videoDetails.thumbnail.thumbnails.length - 1
        ].url,
      description,
      channel: {
        id:
          videoInfo.owner.videoOwnerRenderer.title.runs[0].navigationEndpoint
            .browseEndpoint.browseId,
        name: videoInfo.owner.videoOwnerRenderer.title.runs[0].text,
        thumbnail: videoInfo.owner.videoOwnerRenderer.thumbnail.thumbnails[
          videoInfo.owner.videoOwnerRenderer.thumbnail.thumbnails.length - 1
        ].url.startsWith('https:')
          ? videoInfo.owner.videoOwnerRenderer.thumbnail.thumbnails[
              videoInfo.owner.videoOwnerRenderer.thumbnail.thumbnails.length - 1
            ].url
          : `https:${
              videoInfo.owner.videoOwnerRenderer.thumbnail.thumbnails[
                videoInfo.owner.videoOwnerRenderer.thumbnail.thumbnails.length -
                  1
              ].url
            }`,
        url: `https://www.youtube.com/channel/${videoInfo.owner.videoOwnerRenderer.title.runs[0].navigationEndpoint.browseEndpoint.browseId}`,
      } as Channel,
      uploadDate: videoInfo.dateText.simpleText,
      viewCount: +videoInfo.videoDetails.viewCount,
      likeCount: videoInfo.videoActions.menuRenderer.topLevelButtons[0]
        .toggleButtonRenderer.defaultText.accessibility
        ? +videoInfo.videoActions.menuRenderer.topLevelButtons[0].toggleButtonRenderer.defaultText.accessibility.accessibilityData.label.replace(
            /[^0-9]/g,
            ''
          )
        : null,
      dislikeCount: videoInfo.videoActions.menuRenderer.topLevelButtons[1]
        .toggleButtonRenderer.defaultText.accessibility
        ? +videoInfo.videoActions.menuRenderer.topLevelButtons[1].toggleButtonRenderer.defaultText.accessibility.accessibilityData.label.replace(
            /[^0-9]/g,
            ''
          )
        : null,
      isLiveContent: videoInfo.videoDetails.isLiveContent,
      tags,
    } as VideoDetailed;

    return video;
  }
}

/**
 * Scrape related video from a video from passed HTML
 *
 * @param html HTML
 */
function parseGetRelated(html: string, limit?: number): Video[] | null {
  let videosInfo = [];
  let scrapped = false;

  // not sure about this part
  try {
    const relatedPlayer = html
      .split("RELATED_PLAYER_ARGS': ")[1]
      .split("'BG_P'")[0]
      .split('\n')[0];
    videosInfo = JSON.parse(
      JSON.parse(relatedPlayer.substring(0, relatedPlayer.length - 1))
        .watch_next_response
    ).contents.twoColumnWatchNextResults.secondaryResults.secondaryResults
      .results;
    scrapped = true;
  } catch (err) {}
  if (!scrapped) {
    try {
      videosInfo = JSON.parse(
        html
          .split('{"secondaryResults":{"results":')[1]
          .split(',"continuations":[{')[0]
      );
      scrapped = true;
    } catch (err) {}
  }
  if (!scrapped) {
    try {
      videosInfo = JSON.parse(
        html
          .split('secondaryResults":{"secondaryResults":')[1]
          .split('},"autoplay":{"autoplay":{')[0]
      ).results;
      scrapped = true;
    } catch (err) {}
  }

  // ??
  if (!scrapped) {
    return null;
  }

  const relatedVideos: Video[] = [];

  for (let i = 0; i < videosInfo.length; i += 1) {
    const videoInfo = videosInfo[i].compactVideoRenderer;
    if (videoInfo === undefined || videoInfo.viewCountText === undefined)
      continue;

    const video = {
      id: videoInfo.videoId,
      title: videoInfo.title.simpleText,
      duration: videoInfo.lengthText
        ? getDuration(videoInfo.lengthText.simpleText)
        : null,
      thumbnail:
        videoInfo.thumbnail.thumbnails[
          videoInfo.thumbnail.thumbnails.length - 1
        ].url,
      channel: {
        id:
          videoInfo.longBylineText.runs[0].navigationEndpoint.browseEndpoint
            .browseId,
        name: videoInfo.longBylineText.runs[0].text,
        url: `https://www.youtube.com/channel/${videoInfo.longBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId}`,
      } as Channel,
      uploadDate: videoInfo.publishedTimeText
        ? videoInfo.publishedTimeText.simpleText
        : null,
      viewCount:
        videoInfo.viewCountText && videoInfo.viewCountText.simpleText
          ? +videoInfo.viewCountText.simpleText.replace(/[^0-9]/g, '')
          : +videoInfo.viewCountText.runs[0].text.replace(/[^0-9]/g, ''),
    } as Video;

    if (limit && relatedVideos.length === limit) break;

    relatedVideos.push(video);
  }

  return relatedVideos;
}

/**
 * Scrape up next video from a video from passed HTML
 *
 * @param html HTML
 */
function parseGetUpNext(html: string): Video | null {
  let videoInfo = null;
  let scrapped = false;

  try {
    const relatedPlayer = html
      .split("RELATED_PLAYER_ARGS': ")[1]
      .split("'BG_P'")[0]
      .split('\n')[0];
    videoInfo = JSON.parse(
      JSON.parse(relatedPlayer.substring(0, relatedPlayer.length - 1))
        .watch_next_response
    ).contents.twoColumnWatchNextResults.secondaryResults.secondaryResults
      .results[0].compactAutoplayRenderer.contents[0].compactVideoRenderer;
    scrapped = true;
  } catch (err) {}
  if (!scrapped) {
    try {
      videoInfo = JSON.parse(
        html
          .split('{"secondaryResults":{"results":')[1]
          .split(',"continuations":[{')[0]
      )[0].compactAutoplayRenderer.contents[0].compactVideoRenderer;
      scrapped = true;
    } catch (err) {}
  }
  if (!scrapped) {
    try {
      videoInfo = JSON.parse(
        html
          .split('secondaryResults":{"secondaryResults":')[1]
          .split('},"autoplay":{"autoplay":{')[0]
      ).results[0].compactAutoplayRenderer.contents[0].compactVideoRenderer;
      scrapped = true;
    } catch (err) {}
  }

  if (!scrapped || videoInfo === null) return null; // Video not found

  const upNext: Video = {
    id: videoInfo.videoId,
    channel: {
      id:
        videoInfo.longBylineText.runs[0].navigationEndpoint.browseEndpoint
          .browseId,
      name: videoInfo.longBylineText.runs[0].text,
      url: `https://www.youtube.com/channel/${videoInfo.longBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId}`,
    },
    title: videoInfo.title.simpleText,
    duration: videoInfo.lengthText
      ? getDuration(videoInfo.lengthText.simpleText)
      : null,
    thumbnail:
      videoInfo.thumbnail.thumbnails[videoInfo.thumbnail.thumbnails.length - 1]
        .url,
    uploadDate: videoInfo.publishedTimeText
      ? videoInfo.publishedTimeText.simpleText
      : null,
    viewCount:
      videoInfo.viewCountText && videoInfo.viewCountText.simpleText
        ? +videoInfo.viewCountText.simpleText.replace(/[^0-9]/g, '')
        : null,
  };

  return upNext;
}

// TODO: not sure what happens if the account was deleted
function parseChannel(element: CheerioElement) {
  return {
    name: element.find('.yt-lockup-byline a').text() || null,
    url: `https://www.youtube.com${element
      .find('.yt-lockup-byline a')
      .attr('href')}`,
  } as Channel;
}

function parseUrl(url: string) {
  let resumeWatching = null;
  let id = null;
  if (url.includes('&t=')) {
    [id, resumeWatching] = url.split('&t=');
    resumeWatching = parseInt(resumeWatching, 10);
  } else {
    id = url;
  }
  id = id.replace('/watch?v=', '');
  return [id, resumeWatching];
}

function parseWatchHistoryVideo(
  videoElement: any,
  watchedAt: string
): HistoryVideo {
  const [id, resumeWatching] = parseUrl(
    videoElement.find('a#video-title').attr('href')
  );

  const description = videoElement.find('#description-text')?.text();

  return {
    channel: parseChannel(videoElement),
    title: videoElement.find('#video-title').text(),
    viewCount: videoElement.find('#metadata-line').text(),
    duration: videoElement
      .find('.ytd-thumbnail-overlay-time-status-renderer')
      .text(),
    watchedAt,
    id,
    resumeWatching,
    description,
  } as HistoryVideo;
}

function trimStrings(obj) {
  Object.keys(obj).map(
    (k) => (obj[k] = typeof obj[k] == 'string' ? obj[k].trim() : obj[k])
  );
}

function parseWatchHistoryChunks(
  chunk: CheerioElement,
  $html: any
): HistoryVideo[] {
  const watchedAt = $html(chunk).find('#title').text();

  return $html(chunk)
    .find('#dismissable')
    .map((_, x: CheerioElement) => parseWatchHistoryVideo($html(x), watchedAt))
    .each((_, x) => trimStrings(x))
    .toArray();
}

/**
 * Scrape search result from passed HTML
 *
 * https://github.com/zvodd/Youtube-Watch-History-Scraper/blob/master/youtube_history/spiders/youtube_history_spider.py
 *
 * @param html HTML
 */
function parseWatchHistory(html: string): HistoryVideo[] {
  const $html = cheerio.load(html);
  const results = $html('#contents .ytd-section-list-renderer')
    .map((_, x) => parseWatchHistoryChunks(x, $html))
    .toArray();

  return [].concat(results);
}

function parseSearchHistory(html: string): HistorySearch[] {
  const $html = cheerio.load(html);
  return $html(
    '#contents a.yt-simple-endpoint.style-scope.ytd-search-history-query-renderer'
  )
    .map((_, x: any) => {
      return {
        query: $html(x).find('> div.ytd-search-history-query-renderer').text(),
        searchedAt: $html(x).find('.latest-search-time-text').text(),
      } as HistorySearch;
    })
    .each((_, x) => trimStrings(x))
    .toArray();
}

function parseCommentHistory(html: string): HistoryComment[] {
  const $html = cheerio.load(html);
  return $html(
    '#contents div.main.style-scope.ytd-comment-history-entry-renderer'
  )
    .map((_, x: any) => {
      return {
        videoTitle: $html(x).find('a:nth-child(2)').text(),
        videoUrl: `https://youtube.com${$html(x)
          .find('a:nth-child(2)')
          .attr('href')}`,
        commentUrl: $html(x).find('a:nth-child(1)').attr('href'),
        text: $html(x).find('#content').text(),
        commentedAt: $html(x).find('.timestamp').text(),
      } as HistoryComment;
    })
    .each((_, x) => trimStrings(x))
    .toArray();
}

function extractInteger(str: string): number | null {
  const numbers = str.match(/\d/g);
  if (numbers == null) return null;
  return parseInt(numbers.join(''), 10);
}

// https://www.youtube.com/feed/channels
function parseSubscriptions(html: string): Subscription[] {
  const $html = cheerio.load(html);

  return $html('#contents #content-section')
    .map((_, x) => {
      const $x = $html(x);
      return {
        url: $x.find('a#main-link').attr('href'),
        name: $x.find('#channel-title #text').text(),
        videoCount: extractInteger($x.find('#video-count').text()),
        subscribersCount: $x.find('#subscribers').text(),
        description: $x.find('#description').text(),
        notificationSetting: $x
          .find(
            'a.ytd-subscription-notification-toggle-button-renderer button#button'
          )
          .attr('aria-label'),
      } as Subscription;
    })
    .toArray();
}

export {
  parseSearch,
  parseGetPlaylist,
  parseGetVideo,
  parseGetRelated,
  parseGetUpNext,
  parseWatchHistory,
  parseSearchHistory,
  parseCommentHistory,
  parseSubscriptions,
};

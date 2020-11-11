// https://github.com/SuspiciousLookingOwl/scrape-yt/blob/master/src/common/parser.ts

/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */

import cheerio from 'cheerio';
import {
  Video,
  VideoDetailed,
  Playlist,
  PlaylistDetailed,
  Channel,
  SearchOptions,
} from './types';

/**
 * Get duration in seconds
 *
 * @param s String timestamp
 */
const getDuration = (s: string): number => {
  s = s.replace(/:/g, '.');
  const spl = s.split('.');
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
export function parseSearch(
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
export function parseGetPlaylist(html: string): PlaylistDetailed | {} {
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
      if (videoInfo.shortBylineText === undefined) continue; // Continue if deleted video

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
    const {
      videoOwner,
    } = sidebarRenderer[1].playlistSidebarSecondaryInfoRenderer;

    let videoCount = 0;
    let viewCount = 0;
    let lastUpdatedAt = '';

    if (primaryRenderer.stats.length === 3) {
      videoCount = +primaryRenderer.stats[0]?.runs[0].text.replace(
        /[^0-9]/g,
        ''
      );
      viewCount = +primaryRenderer.stats[1].simpleText.replace(/[^0-9]/g, '');
      lastUpdatedAt = primaryRenderer.stats[2].runs
        ? primaryRenderer.stats[2].runs.join()
        : primaryRenderer.stats[2].simpleText;
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
export function parseGetVideo(html: string): VideoDetailed | {} {
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
      return {}; // Video not found;
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
export function parseGetRelated(html: string, limit: number): Video[] {
  let videosInfo = [];
  let scrapped = false;

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

  if (!scrapped) {
    return [];
  }

  const relatedVideos: Video[] = [];

  for (let i = 0; i < videosInfo.length; i++) {
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

    if (relatedVideos.length < limit) relatedVideos.push(video);
    else break;
  }

  return relatedVideos;
}

/**
 * Scrape up next video from a video from passed HTML
 *
 * @param html HTML
 */
export function parseGetUpNext(html: string): Video | {} {
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

  if (!scrapped || videoInfo === null) return {}; // Video not found

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

export default {
  parseSearch,
  parseGetPlaylist,
  parseGetVideo,
  parseGetRelated,
  parseGetUpNext,
};

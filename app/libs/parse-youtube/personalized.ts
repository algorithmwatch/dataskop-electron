// user history (videos, search, comments) + subscription

import cheerio from 'cheerio';
import {
  Channel,
  HistoryComment,
  HistorySearch,
  HistoryVideo,
  Subscription,
} from './types';
import { extractInteger, trimStrings } from './utils';

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
        publishedAt: $html(x).find('.timestamp').text(),
      } as HistoryComment;
    })
    .each((_, x) => trimStrings(x))
    .toArray();
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
  parseWatchHistory,
  parseSearchHistory,
  parseCommentHistory,
  parseSubscriptions,
};

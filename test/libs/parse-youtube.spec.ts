/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable jest/no-test-callback */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import got from 'got';

import fs from 'fs';
import path, { parse } from 'path';

import {
  parseGetRelated,
  parseGetPlaylist,
  parseWatchHistory,
  parseSearchHistory,
} from '../../app/libs/parse-youtube';

test('parse recommended videos', (done) => {
  got.get('https://www.youtube.com/watch?v=3HyAlm62VsE').then((response) => {
    expect(response.statusCode).toBe(200);

    const videos = parseGetRelated(response.body);
    expect(videos.length).toBeGreaterThan(10);

    const videosLimit = parseGetRelated(response.body, 5);
    expect(videosLimit.length).toBeLessThan(6);
    done();
  });
});

test('parse playlist', (done) => {
  got
    .get(
      'https://www.youtube.com/playlist?list=PLAo4aa6NKcpjx0SVA3JzZHw2wJ3hQ4vmO'
    )
    .then((response) => {
      expect(response.statusCode).toBe(200);

      const playlist = parseGetPlaylist(response.body);
      expect(playlist.title).toBe('Scrape Youtube Test');
      expect(playlist.videoCount).toBe(5);
      expect(playlist.videos.length).toBe(5);
      done();
    });
});

test('scrape watch history', () => {
  const htmlFile = fs.readFileSync(
    path.resolve(__dirname, 'YouTube_watch_history.html'),
    'utf8'
  );

  const videos = parseWatchHistory(htmlFile);
  expect(videos.length).toBeGreaterThan(10);
});

test('scrape search history', () => {
  const htmlFile = fs.readFileSync(
    path.resolve(__dirname, 'YouTube_search_history.html'),
    'utf8'
  );

  const queries = parseSearchHistory(htmlFile);
  expect(queries[0].query).toBe('Johannes Filter');
  expect(queries.length).toBeGreaterThan(10);
});

// const videos = parseGetRelated(html);
//

// .then(data => {
//   console.log('Response -> ',JSON.stringify(data));
//   expect(true).toBeTruthy();
// })
// .catch(err => {
//   console.log('Error -> ', err);
//   expect(true).toBeTruthy();
// });
// });

// const assert = require('chai').use(require('chai-string')).assert;
// const scrape = require('../dist/index');

// const SEARCH_QUERY = 'Never gonna give you up';
// const VIDEO_ID = 'dQw4w9WgXcQ';
// const PLAYLIST_ID = 'PLAo4aa6NKcpjx0SVA3JzZHw2wJ3hQ4vmO';

// function orNull(val, type) {
//   return typeof val === type || val === null;
// }

// function equalOr(val, ...eq) {
//   return eq.includes(val);
// }

// describe('index', () => {
//   describe('search video', () => {
//     let videos;
//     before(async () => {
//       videos = await scrape.search(SEARCH_QUERY, { limit: 3, type: 'video' });
//     });
//     it('search result should be 3', () => {
//       assert.equal(videos.length, 3);
//     });
//     it('match 1st video from search result', () => {
//       const video = videos[0];
//       assert.equal(video.id, VIDEO_ID);
//       assert.equal(
//         video.title,
//         'Rick Astley - Never Gonna Give You Up (Video)'
//       );
//       assert.equal(video.duration, 213);
//       assert.startsWith(video.thumbnail, 'https://i.ytimg.com/');
//       assert.typeOf(video.channel.id, 'string');
//       assert.typeOf(video.channel.name, 'string');
//       assert.typeOf(video.channel.url, 'string');
//       assert.typeOf(video.uploadDate, 'string');
//       assert.isAbove(video.viewCount, 680000000);
//     });
//   });

//   describe('search channel', () => {
//     let channels;
//     before(async () => {
//       channels = await scrape.search('Linus Tech Tips', {
//         limit: 1,
//         type: 'channel',
//       });
//     });
//     it('match 1st channel from search result', () => {
//       const channel = channels[0];
//       assert.isTrue(
//         equalOr(channel.id, 'LinusTechTips', 'UCXuqSBlHAE6Xw-yeJA0Tunw')
//       );
//       assert.equal(channel.name, 'Linus Tech Tips');
//       assert.typeOf(channel.thumbnail, 'string');
//       assert.equal(channel.type, 'channel');
//       assert.isAbove(channel.videoCount, 4900);
//     });
//   });

//   describe('search playlist', () => {
//     let playlists;
//     before(async () => {
//       playlists = await scrape.search('WAN show', {
//         limit: 1,
//         type: 'playlist',
//       });
//     });
//     it('match 1st playlist from search result', () => {
//       const playlist = playlists[0];
//       assert.typeOf(playlist.id, 'string');
//       assert.typeOf(playlist.title, 'string');
//       assert.typeOf(playlist.thumbnail, 'string');
//       assert.equal(playlist.type, 'playlist');
//       assert.isAbove(playlist.videoCount, 260);
//     });
//   });

//   it('match getPlaylist result', async () => {
//     const playlist = await scrape.getPlaylist(PLAYLIST_ID);
//     assert.equal(playlist.id, PLAYLIST_ID);
//     assert.equal(playlist.title, 'Scrape Youtube Test');
//     assert.equal(playlist.videoCount, 5);
//     assert.typeOf(playlist.viewCount, 'number');
//     assert.typeOf(playlist.lastUpdatedAt, 'string');
//     assert.typeOf(playlist.channel.id, 'string');
//     assert.typeOf(playlist.channel.name, 'string');
//     assert.typeOf(playlist.channel.url, 'string');
//     assert.startsWith(playlist.channel.thumbnail, 'https://yt3.ggpht.com');
//     assert.equal(playlist.videos.length, 5);
//     assert.equal(playlist.videos[0].id, 'aROa_qE2FLM');
//     assert.equal(
//       playlist.videos[0].title,
//       'The Paper Kites - Don’t Keep Driving'
//     );
//     assert.equal(playlist.videos[0].duration, 321);
//     assert.startsWith(playlist.videos[0].thumbnail, 'https://i.ytimg.com/');
//   });

//   it('match getVideo result', async () => {
//     const video = await scrape.getVideo(VIDEO_ID);
//     assert.equal(video.id, VIDEO_ID);
//     assert.equal(video.title, 'Rick Astley - Never Gonna Give You Up (Video)');
//     assert.equal(video.duration, 212);
//     assert.typeOf(video.description, 'string');
//     assert.typeOf(video.channel.id, 'string');
//     assert.typeOf(video.channel.name, 'string');
//     assert.typeOf(video.channel.url, 'string');
//     assert.startsWith(video.channel.thumbnail, 'https://yt3.ggpht.com');
//     assert.typeOf(video.uploadDate, 'string');
//     assert.isAbove(video.viewCount, 680000000);
//     assert.isAbove(video.likeCount, 5200000);
//     assert.isAbove(video.dislikeCount, 190000);
//     assert.equal(video.isLiveContent, false);
//     assert.equal(video.tags.length, 3);
//   });

//   describe('getRelated', () => {
//     let videos;
//     before(async () => {
//       videos = await scrape.getRelated(VIDEO_ID, { limit: 3 });
//     });
//     it('related videos should be 3', () => {
//       assert.equal(videos.length, 3);
//     });
//     it('match 1st related video', () => {
//       assert.lengthOf(videos[0].id, 11);
//       assert.typeOf(videos[0].title, 'string');
//       assert.typeOf(videos[0].duration, 'number');
//       assert.startsWith(videos[0].thumbnail, 'https://i.ytimg.com/');
//       assert.typeOf(videos[0].channel.id, 'string');
//       assert.typeOf(videos[0].channel.name, 'string');
//       assert.typeOf(videos[0].channel.url, 'string');
//       assert.isTrue(orNull(videos[0].uploadDate, 'string'));
//       assert.typeOf(videos[0].viewCount, 'number');
//     });
//   });

//   it('check upNext video', async () => {
//     const video = await scrape.getUpNext(VIDEO_ID);
//     assert.lengthOf(video.id, 11);
//     assert.typeOf(video.title, 'string');
//     assert.typeOf(video.duration, 'number');
//     assert.startsWith(video.thumbnail, 'https://i.ytimg.com/');
//     assert.typeOf(video.channel.id, 'string');
//     assert.typeOf(video.channel.name, 'string');
//     assert.typeOf(video.channel.url, 'string');
//     assert.isTrue(orNull(video.uploadDate, 'string'));
//     assert.typeOf(video.viewCount, 'number');
//   });
// });

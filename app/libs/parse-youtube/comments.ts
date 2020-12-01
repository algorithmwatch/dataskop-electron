import cheerio from 'cheerio';
import { extractInteger } from './utils';

const isCommentSpinnerActive = (html: string) => {
  const $html = cheerio.load(html);
  const spinnerElements = $html('#comments #spinner.yt-next-continuation')
    .map((_, x) => {
      const $x = $html(x);
      const xstyle = $x.attr('style');
      if (xstyle && xstyle === 'display: none;') {
        return false;
      }
      const xhidden = $x.attr('aria-hidden');
      if (xhidden && xhidden === 'true') {
        return false;
      }
      return true;
    })
    .toArray();

  return spinnerElements.some((x) => x);
};

function isCommentSectionClosed($html) {
  const url = $html('#comments #contents #message a').attr('href');
  if (url == null) return false;
  return url.includes('https://support.google.com/youtube/answer/9706180');
}

function parseComments(html: string) {
  const $html = cheerio.load(html);
  const outer = $html('#comments');

  if (isCommentSectionClosed($html)) return { isClosed: true };

  const totalComments = extractInteger(outer.find('#count').text());

  const comments = outer
    .find('ytd-comment-thread-renderer')
    .map((_, x) => {
      const $x = $html(x);

      let upvotes = 0;
      const upvotesElem = $x.find('#vote-count-left');
      if (upvotesElem != null) {
        upvotes = parseInt(upvotesElem.text(), 10);
      }

      let numReplies = 0;
      const repliesElem = $x.find('#replies');
      if (repliesElem != null) {
        numReplies = extractInteger(repliesElem.text()) || 1;
      }

      return {
        authorName: $x.find('#author-text').text().trim(),
        authorUrl: $x.find('#author-text').attr('href'),
        text: $x.find('#content-text').text(),
        publishedAt: $x.find('.published-time-text').first().text(),
        upvotes,
        numReplies,
      };
    })
    .toArray();

  return { comments, totalComments, isClosed: false };
}

export { parseComments, isCommentSpinnerActive };

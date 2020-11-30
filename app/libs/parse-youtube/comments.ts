import cheerio from 'cheerio';
import { extractInteger } from './utils';

function parseComments(html: string) {
  const $html = cheerio.load(html);
  const outer = $html('#comments');
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

  const isClosed = false;

  return { comments, totalComments, isClosed };
}

export { parseComments };

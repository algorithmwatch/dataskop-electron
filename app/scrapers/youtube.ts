import { parseGetPlaylist, parseGetRelated } from '../libs/parse-youtube';

// is a special playlist? need to investigate
const scrapePopularVideos = async (getHTML: Function) => {
  const html = await getHTML(
    'https://www.youtube.com/playlist?list=PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-'
  );
  const { videos } = parseGetPlaylist(html);
  return videos;
};

const scrapeRecommendedVideos = async (videoId: string, getHTML: Function) => {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const html = await getHTML(url);
  const videos = parseGetRelated(html, 100);
  return videos;
};

async function* scrapingGenerator(getHTML: Function, limitSteps = 5) {
  let step = 0;
  let maxSteps = null;

  const videos = await scrapePopularVideos(getHTML);

  maxSteps = videos.length + 1;
  if (limitSteps !== null) {
    maxSteps = Math.min(limitSteps, maxSteps);
  }

  step += 1;
  yield [step / maxSteps, videos];

  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const recommendedVideos = await scrapeRecommendedVideos(
      videos[step - 1].id,
      getHTML
    );
    step += 1;
    if (step < maxSteps) {
      yield [step / maxSteps, recommendedVideos];
    } else {
      return [step / maxSteps, recommendedVideos];
    }
  }
}

const config = {
  loginUrl: 'https://www.youtube.com/account',
  logingCookie: 'LOGIN_INFO',
  scrapingGenerator,
};

export default config;

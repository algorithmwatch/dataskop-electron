import { extractIdFromUrl } from "@algorithmwatch/harke-parser";
import _ from "lodash";
import dayjs from "../../../../shared/dayjs";

const NUM_TOP_HASHTAGS = 10;

const transformData = (dump, lookups) => {
  const temp = dump
    .map((x) => {
      const vId = `yv${extractIdFromUrl(x.titleUrl)}`;
      const result = _.get(lookups, `${vId}.result`, null);
      if (!result) return null;

      const d = dayjs(x.time);

      return {
        date: d,
        day: d.format("DD.MM.YYYY"),
        result,
      };
    })
    .filter((x) => x);

  if (temp.length <= 5) {
    return {
      hashtags: [],
      categories: [],
      stats: { totalVideos: "", totalDays: "", topHashtag: "", topLabel: "" },
    };
  }

  const topDiversificationLabels = temp.map((x) => ({
    ..._.pick(x, ["date", "day"]),
    label: x.result.category,
    tooltip: `${x.day}, ${x.result.category}, ${x.result.author}, ${x.result.title}`,
  }));

  const catCounts = _.countBy(topDiversificationLabels.map((x) => x.label));
  const topCat = _(Object.entries(catCounts))
    .orderBy((x) => x[1], "desc")
    .head();

  const allHashtags: any[] = [];
  temp.forEach((x) => {
    const hashtags = _.get(x, "result.keywords", null);
    if (!hashtags) return;
    for (const hashtag of hashtags.split(", ")) {
      const label = hashtag.toLowerCase();
      allHashtags.push({
        ..._.pick(x, ["date", "day"]),
        label,
        tooltip: `${x.day}, ${label}, ${x.result.author}, ${x.result.title}`,
      });
    }
  });

  const counts = _.countBy(allHashtags.map((x) => x.label));
  const topHashtagCounts = _(Object.entries(counts))
    .orderBy((x) => x[1], "desc")
    .slice(0, NUM_TOP_HASHTAGS)
    .value();

  const topHashtags = new Set(topHashtagCounts.map((x) => x[0]));
  const finalHashtags = allHashtags.filter((x) => topHashtags.has(x.label));

  const stats = {
    totalVideos: temp.length,
    totalDays: _.head(temp).date.diff(_.last(temp).date, "day"),
    topHashtag:
      topHashtagCounts && topHashtagCounts.length
        ? _.head(topHashtagCounts)[0]
        : "-",
    topLabel: topCat ? topCat[0] : "-",
  };

  return {
    stats,
    hashtags: finalHashtags,
    categories: topDiversificationLabels,
  };
};

export { transformData };

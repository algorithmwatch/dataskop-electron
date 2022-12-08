import { ascending, extent, flatGroup, group } from "d3-array";
import dayjs from "dayjs";

const topNum = 10;

const excludeTags = new Set([
  "#fyp",
  "#foryourpage",
  "#fy",
  "#stitch",
  "#foryou",
  "#foryoupage",
  "#fürdich",
  "#trending",
  "#viral",
  "#fypシ",
  "#fypage",
]);

const isValidTag = (tag) => !excludeTags.has(tag);

const transformData = (gdprData, metadata) => {
  const history = gdprData.Activity["Video Browsing History"].VideoList.map(
    (d) => ({
      id: d.VideoLink.split("/").reverse()[1],
      date: new Date(d.Date),
      ...d,
    }),
  );

  const historyMap = group(history, (d) => d.id);

  const entries = Object.values(metadata)
    .map((d) => (d ? d.result : null))
    .filter((d) => d)
    .filter((d) => historyMap.get(d.id))
    .map((d) => ({
      dates: historyMap.get(d.id).map((d) => d.date),
      hashtags: [...d.desc.matchAll(/#[\p{L}]+/giu)]
        .map((d) => d[0])
        .filter(isValidTag),
      ...d,
    }));

  // console.log(history, entries);

  const entriesExpanded = entries
    .map((e) => e.dates.map((d) => ({ ...e, date: d })))
    .flat()
    .map((d) => {
      return { ...d, day: dayjs(d.date).format("DD.MM.YY") };
    });

  const entriesTagsExpanded = entriesExpanded
    .map((e) => e.hashtags.map((h) => ({ ...e, tag: h })))
    .flat();

  const topHashtags = flatGroup(entriesTagsExpanded, (d) => d.tag)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, topNum);

  const topHashtagsFlat = topHashtags
    .map(([tag, entries]) => entries.map((e) => ({ label: tag, ...e })))
    .flat();

  const diversificationLabelsFlat = entriesExpanded
    .filter((d) => d.diversificationLabels)
    .map((d) =>
      d.diversificationLabels.map((l) => ({
        label: l,
        ...d,
      })),
    )
    .flat()
    .sort((a, b) => ascending(a.label, b.label));

  const topDiversificationLabels = flatGroup(
    diversificationLabelsFlat,
    (d) => d.label,
  )
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, topNum)
    .map((d) => d[1])
    .flat();

  const dateExtent = extent(entriesExpanded, (d) => d.date);

  const stats = {
    topHashtag: topHashtags[0][0],
    topLabel: topDiversificationLabels[0].label,
    totalVideos: entries.length,
    totalDays: Math.round(
      (dateExtent[1].getTime() - dateExtent[0].getTime()) / 1000 / 60 / 60 / 24,
    ),
  };

  return { topHashtagsFlat, topDiversificationLabels, stats };
};

export { transformData };

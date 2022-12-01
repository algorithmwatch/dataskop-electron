import { ascending, extent, flatGroup, group } from "d3-array";

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

const labelsDict = {
  "Movies & TV works": "Entertainment",
  "Entertainment Culture": "Entertainment",
  Entertainment: "Entertainment",
  Cooking: "Food & Drink",
  "Food & Drink": "Food & Drink",
  Lifestyle: "Lifestyle",
  "Celebrity Clips & Variety Show": "Entertainment",
  "Diary & VLOG": "Lifestyle",
  "Daily Life": "Lifestyle",
  "Scripted Drama": "Entertainment",
  "Mukbangs & Tasting": "Food & Drink",
  "Lip-sync": "Entertainment",
  Photography: "Lifestyle",
  Selfies: "Lifestyle",
  Dance: "Entertainment",
  "Singing & Dancing": "Entertainment",
  Talents: "Entertainment",
  "Comics & Cartoon, Anime": "Entertainment",
  "Anime & Comics": "Entertainment",
  Music: "Entertainment",
  Beauty: "Lifestyle",
  "Beauty & Care": "Lifestyle",
  "Beauty & Style": "Lifestyle",
  "Singing & Instruments": "Entertainment",
  Romance: "Entertainment",
  Relationship: "Lifestyle",
  "Family & Relationship": "Lifestyle",
  "Entertainment News": "Entertainment",
  Family: "Lifestyle",
  "Tech Products & Infos": "Technology",
  Technology: "Technology",
  "Culture & Education & Technology": "Technology",
  "Traditional Sports": "Sports",
  Sports: "Sports",
  "Sport & Outdoor": "Sports",
  Comedy: "Entertainment",
  Performance: "Entertainment",
  "Video Games": "Games",
  Games: "Games",
  "Nail Art": "Lifestyle",
  Animals: "Nature",
  Nature: "Nature",
  Pets: "Nature",
  "Graphic Art": "Art",
  Art: "Art",
  "Extreme Sports": "Sports",
  "Farm Animals": "Nature",
  Cosplay: "Entertainment",
  Fitness: "Lifestyle",
  "Fitness & Health": "Lifestyle",
  "Toys & Collectables": "Lifestyle",
  "Professional Personal Development": "Lifestyle",
  Education: "Education",
  "Random Shoot": "Lifestyle",
  Others: "Lifestyle",
  "Home & Garden": "Lifestyle",
  "Street Interviews & Social Experiments": "Lifestyle",
  Society: "Lifestyle",
  Hair: "Lifestyle",
  Outfit: "Lifestyle",
  "Recreation Facilities": "Lifestyle",
  Travel: "Lifestyle",
  "Work & Jobs": "Lifestyle",
  "School Education": "Education",
  "DIY & Handcrafts": "Lifestyle",
  Babies: "Lifestyle",
  "Campus Life": "Lifestyle",
  Science: "Science",
  "Social News": "News",
  Magic: "Entertainment",
  Humanities: "Education",
  "Social Issues": "News",
  "Non-Video Games": "Games",
  "Business & Finance": "Business",
  Pranks: "Entertainment",
  Drinks: "Food & Drink",
  "Scripted Comedy": "Entertainment",
  "Hilarious Fails": "Entertainment",
  "Food Display": "Food & Drink",
  "Health & Wellness": "Lifestyle",
  "Finger Dance & Basic Dance": "Entertainment",
  Advertisement: "Business",
  "Software & APPs": "Technology",
  "Supernatural & Horror": "Entertainment",
  "Food Tour & Recommendations": "Food & Drink",
};

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
      const day = d.date.getDate();
      const month = d.date.getMonth();
      return { ...d, day: `${day}.${month}` };
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
        category: labelsDict[l],
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

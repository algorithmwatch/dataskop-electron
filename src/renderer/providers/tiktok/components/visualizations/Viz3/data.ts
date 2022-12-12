import _ from "lodash";

// TODO: Add limit to not iterate over very large dumps

const transformData = (gdprData, metadata) => {
  const addData = (d) => {
    const id = (d.Link || d.VideoLink).split("/").reverse()[1];
    const data = _.get(metadata, `tv${id}`, null);
    let item = {};
    if (data && data.result) item = data.result;
    const author = item.author?.uniqueId || item.author;
    const nickname = item.author?.nickname || item.nickname;
    return { ...d, id, ...item, author, nickname };
  };

  const favList = gdprData.Activity["Favorite Videos"].FavoriteVideoList.map(
    addData,
  )
    .map((d) => ({ ...d, slot: "favorite" }))
    .filter((d) => d.author);

  const shareList = gdprData.Activity["Share History"].ShareHistoryList.map(
    addData,
  )
    .map((d) => ({ ...d, slot: "share" }))
    .filter((d) => d.author);

  const likeList = gdprData.Activity["Like List"].ItemFavoriteList.map(addData)
    .map((d) => ({ ...d, slot: "like" }))
    .filter((d) => d.author);

  // const viewList = entriesExpanded.map((d) => ({ ...d, slot: "view" }));
  const viewList = gdprData.Activity["Video Browsing History"].VideoList.map(
    addData,
  )
    .map((d) => ({ ...d, slot: "view" }))
    .filter((d) => d.author);

  const allData = [...shareList, ...favList, ...likeList, ...viewList];

  const totalNicknames = new Set(allData.map((d) => d.author)).size;

  const stats = {
    favorites: favList.length,
    shares: shareList.length,
    likes: likeList.length,
    views: viewList.length,
    totalNicknames,
  };

  return { allData, stats };
};

export { transformData };

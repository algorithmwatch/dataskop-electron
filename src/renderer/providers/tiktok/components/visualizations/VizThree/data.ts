import { group } from "d3-array";

const transformData = (gdprData, metadata) => {
  const metaLookup = group(Object.values(metadata), (d) => d?.result?.id);

  const addData = (d) => {
    const id = (d.Link || d.VideoLink).split("/").reverse()[1];
    const data = metaLookup.get(id);
    let item = {};
    if (data?.length && data[0].result) item = data[0].result;
    return { ...d, id, ...item };
  };

  const commentsList = gdprData.Comment.Comments.CommentsList;
  const shareList = gdprData.Activity["Share History"].ShareHistoryList.map(
    addData,
  )
    .map((d) => ({ ...d, slot: "share" }))
    .filter((d) => d.nickname);

  const favoriteList = gdprData.Activity["Like List"].ItemFavoriteList.map(
    addData,
  )
    .map((d) => ({ ...d, slot: "like" }))
    .filter((d) => d.nickname);

  // const viewList = entriesExpanded.map((d) => ({ ...d, slot: "view" }));
  const viewList = gdprData.Activity["Video Browsing History"].VideoList.map(
    addData,
  )
    .map((d) => ({ ...d, slot: "view" }))
    .filter((d) => d.nickname);

  const allData = [...shareList, ...favoriteList, ...viewList];

  const totalNicknames = new Set(allData.map((d) => d.nickname)).size;

  const stats = {
    comments: commentsList.length,
    shares: shareList.length,
    favorites: favoriteList.length,
    views: viewList.length,
    totalNicknames,
  };

  return { allData, stats };
};

export { transformData };

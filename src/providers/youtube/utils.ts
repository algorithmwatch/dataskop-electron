const getThumbnails = (id) => {
  /**
   * Returns the average of two numbers.
    https://yt-thumb.canbeuseful.com/en
   */

  // the first image is the `default` image.
  const small = [1, 2, 3].map(
    (x) => `https://img.youtube.com/vi/${id}/${x}.jpg`,
  );

  small.unshift(`https://img.youtube.com/vi/${id}/default.jpg`);

  const defaultImage = {
    mq: `http://img.youtube.com/vi/${id}/mqdefault.jpg`,
    hq: `http://img.youtube.com/vi/${id}/hqdefault.jpg`,
    sd: `http://img.youtube.com/vi/${id}/sddefault.jpg`,
    maxRes: `http://img.youtube.com/vi/${id}/maxresdefault.jpg`,
  };

  return { small, defaultImage };
};

export { getThumbnails };

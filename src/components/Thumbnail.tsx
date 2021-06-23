import Tippy, { TippyProps } from '@tippyjs/react';
import React from 'react';

export default function Thumbnail({
  videoId,
  url,
  tippyOptions,
}: {
  videoId?: string | undefined;
  url?: string | undefined;
  tippyOptions?: TippyProps | undefined;
}) {
  if (!videoId && !url) {
    return null;
  }

  const thumbUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : url;

  return (
    <div className="w-24 h-14 bg-gray-300 overflow-hidden flex place-items-center flex-shrink-0">
      {tippyOptions ? (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Tippy {...tippyOptions}>
          <img src={thumbUrl} alt="" />
        </Tippy>
      ) : (
        <img src={thumbUrl} alt="" />
      )}
    </div>
  );
}

/* eslint-disable jsx-a11y/mouse-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */
import { VideoPage } from '@algorithmwatch/harke';
import { faImages } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy, { TippyProps } from '@tippyjs/react';
import React from 'react';
import dayjs from '../utils/dayjs';

// const categoriesIconMap = {
//   'Film & Animation': ,
//   'Autos & Vehicles': ,
//   'Music': ,
//   'Pets & Animals': ,
//   'Sports': ,
//   'Travel & Events': ,
//   'Gaming': ,
//   'People & Blogs': ,
//   'Comedy': ,
//   'Entertainment': ,
//   'News & Politics': ,
//   'Howto & Style': ,
//   'Education': ,
//   'Science & Technology': ,
//   'Nonprofits & Activism': ,
// }

export default function VideoThumbnail({
  videoId,
  url,
  type = 0,
  tippyOptions,
  className,
  onClickCallback,
  onMouseOverCallback,
  onMouseOutCallback,
}: {
  videoId?: string;
  url?: string;
  type?: 0 | 1;
  tippyOptions?: TippyProps;
  className?: string;
  onClickCallback?: () => void;
  onMouseOverCallback?: () => void;
  onMouseOutCallback?: () => void;
}) {
  if (!videoId && !url) {
    return null;
  }

  const thumbUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : url;

  const contentElement = (() => {
    if (type === 0) {
      return (
        <img
          src={thumbUrl}
          alt=""
          className={className}
          onClick={() => onClickCallback && onClickCallback()}
          onMouseOver={() => onMouseOverCallback && onMouseOverCallback()}
          onMouseOut={() => onMouseOutCallback && onMouseOutCallback()}
        />
      );
    }
    if (type === 1) {
      // const getCategoryIcon = categoriesIconMap[]
      return (
        <div
          className={`w-full h-full ${className}`}
          onMouseOver={() => onMouseOverCallback && onMouseOverCallback()}
          onMouseOut={() => onMouseOutCallback && onMouseOutCallback()}
        >
          <FontAwesomeIcon icon={faImages} />
        </div>
      );
    }
  })();

  return (
    <div className="w-24 h-14 bg-gray-300 overflow-hidden flex place-items-center flex-shrink-0">
      {tippyOptions ? (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Tippy {...tippyOptions}>{contentElement}</Tippy>
      ) : (
        { contentElement }
      )}
    </div>
  );
}

export function TooltipContent({
  video,
}: {
  video: Partial<VideoPage>;
}): JSX.Element {
  const tooltipContent = [];

  if (video.title) {
    tooltipContent.push(
      <div key="title" className="font-bold text-base">
        {video.title}
      </div>,
    );
  }

  if (video.channel?.name || video.uploadDate) {
    tooltipContent.push(
      <div key="creator-udate">
        {video.channel?.name && video.channel.name}
        {video.uploadDate && `, ${dayjs(video.uploadDate).format('LL')}`}
      </div>,
    );
  }

  if (video.viewCount) {
    tooltipContent.push(<div key="view-count">{video.viewCount} Aufrufe</div>);
  }

  return <>{tooltipContent}</>;
}

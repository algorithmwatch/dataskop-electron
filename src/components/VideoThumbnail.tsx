import Tippy, { TippyProps } from '@tippyjs/react';
import React from 'react';
import dayjs from '../utils/dayjs';

export default function VideoThumbnail({
  videoId,
  url,
  tippyOptions,
  className,
  onClickCallback,
  onMouseOverCallback,
  onMouseOutCallback,
}: {
  videoId?: string;
  url?: string;
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

  const imgElement = (
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <img
      src={thumbUrl}
      alt=""
      className={className}
      onClick={() => onClickCallback && onClickCallback()}
      onMouseOver={() => onMouseOverCallback && onMouseOverCallback()}
      onMouseOut={() => onMouseOutCallback && onMouseOutCallback()}
    />
  );

  return (
    <div className="w-24 h-14 bg-gray-300 overflow-hidden flex place-items-center flex-shrink-0">
      {tippyOptions ? (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Tippy {...tippyOptions}>{imgElement}</Tippy>
      ) : (
        { imgElement }
      )}
    </div>
  );
}

interface ThumbnailTooltipContent {
  title: string;
  channelName: string;
  uploadDate?: string;
  viewCount?: number;
}

export function TooltipContent({
  video,
}: {
  video: ThumbnailTooltipContent;
}): JSX.Element {
  const tooltipContent = [];

  if (video.title) {
    tooltipContent.push(
      <div key="title" className="font-bold text-base">
        {video.title}
      </div>,
    );
  }

  if (video.channelName || video.uploadDate) {
    tooltipContent.push(
      <div key="creator-udate">
        {video.channelName && video.channelName}
        {video.uploadDate && `, ${dayjs(video.uploadDate).format('LL')}`}
      </div>,
    );
  }

  if (video.viewCount) {
    tooltipContent.push(<div key="view-count">{video.viewCount} Aufrufe</div>);
  }

  return <>{tooltipContent}</>;
}

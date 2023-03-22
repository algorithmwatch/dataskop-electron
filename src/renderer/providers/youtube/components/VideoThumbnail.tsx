/* eslint-disable jsx-a11y/mouse-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */
import { Channel } from "@algorithmwatch/harke-parser";
import Tippy, { TippyProps } from "@tippyjs/react";
import _ from "lodash";
import dayjs from "../../../../shared/dayjs";

const VideoThumbnail = ({
  videoId,
  url,
  type = 0,
  creatorName,
  tippyOptions,
  className,
  onClickCallback,
  onMouseOverCallback,
  onMouseOutCallback,
}: {
  videoId?: string;
  url?: string;
  type?: 0 | 1;
  creatorName?: string;
  tippyOptions?: TippyProps;
  className?: string;
  onClickCallback?: () => void;
  onMouseOverCallback?: () => void;
  onMouseOutCallback?: () => void;
}) => {
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
      const truncatedString = _.truncate(creatorName, {
        length: 10,
        omission: "…",
      });
      return (
        <div
          className={`w-full h-full bg-yellow-300 flex items-center justify-center text-xs font-medium leading-relaxed ${className}`}
          onMouseOver={() => onMouseOverCallback && onMouseOverCallback()}
          onMouseOut={() => onMouseOutCallback && onMouseOutCallback()}
        >
          {truncatedString}
        </div>
      );
    }
    return <div />;
  })();

  return (
    <div className="w-24 h-14 bg-gray-300 overflow-hidden flex place-items-center shrink-0">
      {tippyOptions ? (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Tippy {...tippyOptions}>{contentElement}</Tippy>
      ) : (
        { contentElement }
      )}
    </div>
  );
};

export default VideoThumbnail;

export interface TooltipContentType {
  title: string;
  channel: Partial<Channel>;
  uploadDate?: Date;
  viewCount?: number;
  upvotes?: number | null;
  downvotes?: number | null;
}

export const TooltipContent = ({
  video,
}: {
  video: TooltipContentType;
}): JSX.Element => {
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
        {video.uploadDate && `, ${dayjs(video.uploadDate).format("LL")}`}
      </div>,
    );
  }

  if (video.viewCount) {
    tooltipContent.push(
      <div key="view-count">
        {String(video.viewCount).replace(/(.)(?=(\d{3})+$)/g, "$1.")} Aufrufe
      </div>,
    );
  }

  return <>{tooltipContent}</>;
};

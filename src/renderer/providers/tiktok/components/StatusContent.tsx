import { faLoader } from "@fortawesome/pro-regular-svg-icons";

import Content from "./Content";

const StatusContent = ({
  title,
  body,
  fancyNotificationText,
}: {
  title: string;
  body: string;
  fancyNotificationText?: boolean;
}) => {
  return (
    <Content title={title} icon={faLoader} iconSpinning theme="tiktokAnimated">
      <p>{body}</p>

      {fancyNotificationText && (
        <div className="mt-24 text-base font-medium relative">
          <span className="absolute inset-0 animate-fade1 flex items-center justify-center">
            <div className="rounded-full bg-white/50 px-5 py-4">
              Du erhältst eine Benachrichtigung, sobald es weitergehen kann.
            </div>
          </span>
          {/* <span className="absolute inset-0 animate-fade2 flex items-center justify-center">
          <div className="rounded-full bg-white/50 px-5 py-4">
          Du kannst die App schließen, aber sie muss im Hintergrund geöffnet
          bleiben.
          </div>
        </span> */}
        </div>
      )}
    </Content>
  );
};

export default StatusContent;

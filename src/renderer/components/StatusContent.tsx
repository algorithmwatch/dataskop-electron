/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { faLoader, IconDefinition } from "@fortawesome/pro-regular-svg-icons";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { Button } from "renderer/components/Button";
import HelpButton from "renderer/components/HelpButton";
import Modal from "renderer/components/Modal";
import ProgressBar from "renderer/components/ProgressBar";
import { useConfig } from "renderer/contexts";
import dayjs from "../../shared/dayjs";
import { getPrintStatus } from "../../shared/status";
import { addStatusReset, getAllStati } from "../lib/status";
import Content from "./Content";

const RelativeTime = ({ time }: { time: Dayjs }) => {
  const [curTime, setCurTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurTime(new Date());
    }, 1000 * 30);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return <span id={curTime.toISOString()}>{time.fromNow()}</span>;
};

const StatusContent = ({
  status,
  title,
  body,
  icon = faLoader,
  helpButtons,
  fancyNotificationText,
  allowReset,
  modal1Content,
  modal2Content,
  modal1Label,
  modal2Label,
}: {
  status: any;
  title: string;
  body: string;
  icon?: IconDefinition;
  helpButtons?: boolean;
  fancyNotificationText?: boolean;
  allowReset?: boolean;
  modal1Content?: JSX.Element;
  modal2Content?: JSX.Element;
  modal1Label?: string;
  modal2Label?: string;
}) => {
  const {
    state: { isMac },
  } = useConfig();

  const [progress, setProgress] = useState([0, 0]);
  const [statusRows, setSR] = useState<any[]>([]);

  useEffect(() => {
    window.electron.ipc.on("set-progress", setProgress);
    return () =>
      window.electron.ipc.removeListener("set-progress", setProgress);
  }, []);

  // Load all stati when there is an status change
  useEffect(() => {
    // eslint-disable-next-line promise/catch-or-return
    (async () => {
      const res = await getAllStati();

      setSR(
        res.map((x) => ({
          status: x.fields.status as string,
          updatedAt: dayjs(x.scrapedAt as number),
        })),
      );
    })();
  }, [status && status.updatedAt]);

  const [modal1IsOpen, setModal1IsOpen] = useState(false);
  const [modal2IsOpen, setModal2IsOpen] = useState(false);
  const [modal3IsOpen, setModal3IsOpen] = useState(false);

  return (
    <>
      <Modal
        theme="tiktok"
        isOpen={modal1IsOpen}
        closeModal={() => setModal1IsOpen(false)}
      >
        {modal1Content}
      </Modal>
      <Modal
        theme="tiktok"
        isOpen={modal2IsOpen}
        closeModal={() => setModal2IsOpen(false)}
      >
        {modal2Content}
      </Modal>
      <Modal
        theme="tiktok"
        isOpen={modal3IsOpen}
        closeModal={() => setModal3IsOpen(false)}
      >
        <div className="text-center">
          <h1 className="hl-2xl mb-4">Zeitleiste der Statusänderungen</h1>
          <div className="max-h-[40vh] overflow-auto text-left">
            {statusRows.map((x) => (
              <p key={x.updatedAt.format()}>{`${x.updatedAt.format(
                "L LT",
              )} Uhr: ${getPrintStatus(x.status)}`}</p>
            ))}
          </div>
        </div>
      </Modal>

      <Content title={title} icon={icon} iconSpinning theme="tiktokAnimated">
        <p>{body}</p>

        {helpButtons && (
          <div className="mt-7 xl:mt-14 space-x-6">
            <HelpButton onClick={() => setModal1IsOpen(true)}>
              {modal1Label}
            </HelpButton>
            <HelpButton onClick={() => setModal2IsOpen(true)}>
              {modal2Label}
            </HelpButton>
          </div>
        )}

        {allowReset && (
          <div className="mt-2 xl:mt-5">
            <Button
              theme="outline"
              onClick={async () => {
                // Don't log the user out
                window.electron.log.info(
                  "Resetting `status` and restarting app",
                );
                await addStatusReset();
                window.electron.ipc.invoke("restart");
              }}
            >
              Zurücksetzen
            </Button>
          </div>
        )}

        {fancyNotificationText && (
          <div className="mt-12 xl:mt-24 text-base font-medium relative whitespace-nowrap">
            <span className="absolute inset-0 animate-fade1 flex items-center justify-center">
              <div className="rounded-full bg-white/50 px-5 py-4">
                Du erhältst eine Benachrichtigung, sobald es weitergehen kann.
              </div>
            </span>
            <span className="absolute inset-0 animate-fade2 flex items-center justify-center">
              <div className="rounded-full bg-white/50 px-5 py-4">
                {`Du kannst das Fenster ${
                  isMac ? "schließen" : "minimieren"
                }, aber die App muss im Hintergrund geöffnet bleiben.`}
              </div>
            </span>
          </div>
        )}
        {progress[0] === 0 && status && status.updatedAt && (
          <p
            className="absolute right-5 bottom-2 text-sm 2xl:text-base text-gray-600 cursor-pointer"
            onClick={() => setModal3IsOpen(true)}
          >
            Letzte Änderung: <RelativeTime time={status.updatedAt} />
          </p>
        )}

        {progress[0] !== 0 && (
          <ProgressBar value={progress[0]} eta={progress[1]} />
        )}
      </Content>
    </>
  );
};

export default StatusContent;

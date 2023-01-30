/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { faLoader, IconDefinition } from "@fortawesome/pro-regular-svg-icons";
import { useEffect, useState } from "react";
import { Button } from "renderer/components/Button";
import Modal from "renderer/components/Modal";
import ProgressBar from "renderer/components/ProgressBar";
import { useConfig } from "renderer/contexts";
import dayjs from "renderer/lib/dayjs";
import HelpButton from "renderer/providers/tiktok/components/HelpButton";
import { addStatusReset, getAllStati, getPrintStatus } from "../lib/status";
import Content from "./Content";

const RelativeTime = ({ time }) => {
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
}: {
  status: any;
  title: string;
  body: string;
  icon?: IconDefinition;
  helpButtons?: boolean;
  fancyNotificationText?: boolean;
  allowReset?: boolean;
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
        <div className="text-center">
          <h1 className="hl-2xl mb-4">Wie lange dauert das?</h1>
          <p className="">
            Es kann bis zu einer Woche Tage dauern, bis TikTok die DSGVO-Daten
            bereitstellt. Es ist deshalb wichtig, dass du die DataSkop-App nicht
            schließt und sie im Hintergrund geöffnet bleibt. Du erhältst eine
            Benachrichtigung, sobald es weitergehen kann.
          </p>
        </div>
      </Modal>
      <Modal
        theme="tiktok"
        isOpen={modal2IsOpen}
        closeModal={() => setModal2IsOpen(false)}
      >
        <div className="text-center">
          <h1 className="hl-2xl mb-4">Was kommt danach?</h1>
          <p className="">
            Wenn die DataSkop-App die Daten heruntergeladen und verarbeitet hat,
            werden dir verschiedene interaktive Grafiken präsentiert, die dein
            Nutzungsverhalten auf TikTok visualisieren und einordnen.
          </p>
        </div>
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
              Wie lange dauert das?
            </HelpButton>
            <HelpButton onClick={() => setModal2IsOpen(true)}>
              Was kommt danach?
            </HelpButton>
          </div>
        )}

        {allowReset && (
          <div className="mt-2 xl:mt-5">
            <Button
              onClick={async () => {
                // Don't log the user out
                window.electron.log.info(
                  "Resetting `status` and restarting app",
                );
                await addStatusReset();
                window.electron.ipc.invoke("restart");
              }}
            >
              Status zurücksetzen & neu starten
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

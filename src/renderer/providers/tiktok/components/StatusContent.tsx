import { faLoader, IconDefinition } from "@fortawesome/pro-regular-svg-icons";
import StatusContent from "../../../components/StatusContent";

const TikTokStatusContent = ({
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
  return (
    <StatusContent
      status={status}
      title={title}
      body={body}
      icon={icon}
      helpButtons={helpButtons}
      fancyNotificationText={fancyNotificationText}
      allowReset={allowReset}
      modal1Label="Wie lange dauert das?"
      modal2Label="Was kommt danach?"
      modal1Content={
        <div className="text-center">
          <h1 className="hl-2xl mb-4">Wie lange dauert das?</h1>
          <p className="">
            Es dauert mehrere Tage, bis TikTok die DSGVO-Daten bereitstellt. Es
            ist deshalb wichtig, dass du die DataSkop-App nicht schließt und sie
            im Hintergrund geöffnet bleibt. Du erhältst eine Benachrichtigung,
            sobald es weitergehen kann.
          </p>
        </div>
      }
      modal2Content={
        <div className="text-center">
          <h1 className="hl-2xl mb-4">Was kommt danach?</h1>
          <p className="">
            Wenn die DataSkop-App die Daten heruntergeladen und verarbeitet hat,
            werden dir verschiedene interaktive Grafiken präsentiert, die dein
            Nutzungsverhalten auf TikTok visualisieren und einordnen.
          </p>
        </div>
      }
    />
  );
};

export default TikTokStatusContent;

import { faLoader, IconDefinition } from "@fortawesome/pro-regular-svg-icons";
import StatusContent from "../../../components/StatusContent";

const GTYTStatusContent = ({
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
            Es dauert in der Regel wenige Minuten bis die Daten verarbeitet
            werden. Bitte schließ die App nicht und lass sie im Hintergrund
            laufen.
          </p>
        </div>
      }
      modal2Content={
        <div className="text-center">
          <h1 className="hl-2xl mb-4">Was kommt danach?</h1>
          <p className="">
            Wenn die DataSkop-App die Daten verarbeitet hat, werden dir
            verschiedene interaktive Grafiken präsentiert, die dein
            Nutzungsverhalten auf YouTube visualisieren und einordnen.
          </p>
        </div>
      }
    />
  );
};

export default GTYTStatusContent;

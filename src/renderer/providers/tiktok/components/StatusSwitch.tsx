import { Dayjs } from "dayjs";
import { isStatusPending } from "../lib/status";
import StatusContent from "./StatusContent";

interface Status {
  status: string;
  updatedAt: Dayjs;
}

const StatusSwitch = ({ status }: { status: Status }): JSX.Element => {
  /* scraping-done: Keine Anzeige notwendig */
  return (
    <>
      {isStatusPending(status.status) && (
        <StatusContent
          status={status}
          title="DSGVO-Daten angefordert"
          body="Bitte habe noch etwas Geduld. Deine DSGVO-Daten wurden angefordert, aber TikTok bietet sie noch nicht zum Download an."
          helpButtons
          fancyNotificationText
        />
      )}
      {[
        "monitoring-download-action-required",
        "download-action-required",
      ].includes(status.status) && (
        <StatusContent
          status={status}
          title="Aktion erforderlich"
          body="Deine Hilfe ist erforderlich, um die Daten herunterzuladen. Bitte warte einen kurzen Moment und folge den Anweisungen. Es kann z. B. sein, dass du einen Code eingeben musst, der an dein Telefon gesendet wurde."
        />
      )}
      {[
        "monitoring-download-success",
        "download-success",
        "files-imported",
      ].includes(status.status) && (
        <StatusContent
          status={status}
          title="Daten werden verarbeitet"
          body="Es dauert nicht mehr lange! Deine TikTok-Daten wurden heruntergeladen und werden nun verarbeitet."
          helpButtons
          fancyNotificationText
        />
      )}
      {[
        "monitoring-download-error",
        "monitoring-download-error-timeout",
        "download-error",
        "download-error-timeout",
      ].includes(status.status) && (
        <StatusContent
          status={status}
          title="Fehler beim Download"
          body="Wir konnten deine TikTok-Daten nicht herunterladen. Besuche Tiktok.com im Browser und lade dir die DSGVO-Daten in deinem Benutzerkonto herunter. Anschließend kannst du sie in der DataSkop-App importieren."
          allowReset
        />
      )}
      {["monitoring-download-expired"].includes(status.status) && (
        <StatusContent
          status={status}
          title="Download abgelaufen"
          body="Der Download für deine DSGVO-Daten ist abgelaufen. Bitte starte die App erneut und beantrage ihn noch einmal."
          allowReset
        />
      )}
      {["data-error-request"].includes(status.status) && (
        <StatusContent
          status={status}
          title="DSGVO-Anfrage fehlgeschlagen"
          body="Wir konnten deine DSGVO-Daten nicht beantragen. Besuche Tiktok.com im Browser und lade dir die DSGVO-Daten in deinem Benutzerkonto herunter. Anschließend kannst du sie in der DataSkop-App importieren."
          allowReset
        />
      )}
      {[
        "monitoring-error-nothing-found",
        "monitoring-error-tab-not-found",
        "data-error-tab-not-found",
        "status-not-available",
      ].includes(status.status) && (
        <StatusContent
          status={status}
          title="Fehler beim Download"
          body="Wir konnten den Status deines DSGVO-Downloads nicht überprüfen. Besuche Tiktok.com im Browser und lade dir die DSGVO-Daten in deinem Benutzerkonto herunter. Anschließend kannst du sie in der DataSkop-App importieren."
          allowReset
        />
      )}
    </>
  );
};

export default StatusSwitch;
/* eslint-disable react/no-unescaped-entities */
import ImportPage from "../../../pages/ImportPage";

const desc = (
  <p>
    Bitte{" "}
    <a
      className="underline"
      target="_blank"
      href="https://takeout.google.com/takeout/custom/youtube?dnm=false&continue=https://myaccount.google.com/yourdata/youtube&hl=de"
      rel="noreferrer"
    >
      beantrage deine Daten auf YouTube
    </a>{" "}
    und lade sie herunter. Bitte wähle "JSON" als Dateiformat unter dem Punkt
    "Mehre Dateiformate" für "Verlauf". Es reicht wenn du nur deinen "Verlauf"
    exportierst. <br /> <br />
    Lade dir den Export herunter und entpacke die ZIP-Datei. Bitte importiere
    anschließend die Datei "Wiedergabeverlauf.json" (engl. "watch-history.json")
    im Ordner "Verlauf" (engl. "History").
  </p>
);

const GTYoutubeImportPage = (): JSX.Element => {
  return (
    <ImportPage
      previousPath="/google-takeout-youtube/intro"
      nextPath="/google-takeout-youtube/waiting"
      description={desc}
      clearImportsOnClose
    />
  );
};

export default GTYoutubeImportPage;

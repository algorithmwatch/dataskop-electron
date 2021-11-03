import { faAngleLeft, faAngleRight } from '@fortawesome/pro-solid-svg-icons';
import { RouteComponentProps } from 'react-router-dom';
import ContentWrapper from '../components/ContentWrapper';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useNavigation } from '../contexts/navigation';
import explainImage1 from '../static/images/scraping-explanation/scraper1.png';
import explainImage2 from '../static/images/scraping-explanation/scraper2.png';

export default function ScrapingExplanationPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();

  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Zurück',
      startIcon: faAngleLeft,
      theme: 'link',
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getPreviousPage('path'));
      },
    },
    {
      label: 'Weiter',
      // size: 'large',
      endIcon: faAngleRight,
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
      },
    },
  ];

  return (
    <>
      <ContentWrapper>
        <div className="hl-4xl mb-6">Wie funktioniert Scraping?</div>
        <div className="space-y-4">
          <p>
            Um Daten auszulesen, setzt DataSkop bei YouTube auf sogenanntes
            Screen Scraping. Wörtlich lässt sich das mit
            „Bildschirm-Ausschabung“ übersetzen. Das funktioniert so: Während du
            das hier liest, läuft in einem für dich gerade nicht sichtbaren
            Fenster YouTube. (Du kannst es durch einen Klick oben rechts auf den
            Ladebalken sehen).
          </p>
          <p>
            Der Scraper von DataSkop – ein von uns entwickeltes Softwareprogramm
            – besucht dort verschiedene Seiten und pickt bestimmte Informationen
            heraus. Dabei sucht DataSkop nach bestimmten Abschnitte im HTML-Code
            der YouTube-Webseite. HTML – Hypertext Markup Language – ist die
            Sprache, mit der die Informationen über das Internet an den Browser
            (Firefox, Chrome usw.) übertragen werden. Daraus berechnet
            (Englisch: „rendered“) der Browser dann die Darstellung der Seite.
            Konkret sieht das dann beispielsweise so aus, dass DataSkop „weiß“
            zwischen welchen Markierungen oder Schlüsselwörtern im HTML-Code der
            Titel eines Videos zu finden ist.
          </p>
          <div>
            <img src={explainImage1} alt="" />
          </div>
          <p>
            Der Scraper von DataSkop kann aber noch mehr. Er kann automatisch
            Listen von Begriffen in die Suche eingeben und die Suchergebnisse
            speichern. Auch kann er ein Video besuchen und automatisch
            speichern, welche Videos die Autoplay-Funktion von YouTube als
            nächstes abspielen würde. Und für jedes dieser Videos können
            zusätzlich die ersten zehn empfohlenen Videos mitgespeichert werden.
          </p>
          <div>
            <img src={explainImage2} alt="" />
          </div>
          <p>
            Damit der Scraper nicht private Daten in deine Datenspende packt,
            sucht er in den Informationen zu Videos in deinem Verlauf (Englisch:
            „watch history“) nach dem Hinweis „privat“ oder „ungelistet“. Wird
            dieser Marker gefunden, wird das Video in der Liste sozusagen
            „geschwärzt“. Das passiert alles auf deinem Rechner. In deiner
            Datenspende tauchen diese Videos nicht auf. Wenn das Scraping
            durchgelaufen ist, kannst du dir auch noch einmal deine Daten
            betrachten.
          </p>
          <p>Weiter geht es mit der Auswertung deines YouTube-Profils.</p>
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}

import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React from 'react';
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
            Um Daten auszulesen, setzt DataSkop bei YouTube auf so genanntes
            „Screen Scraping“. Das lässt sich wörtliche so übersetzen:
            Bildschirm-Ausschabung. D.h. während Du das hier liest, läuft in
            einem für Dich nicht gerade nicht sichtbaren Fenster YouTube. (Du
            kannst es durch einen Klick oben rechts auf den Fortschrittsbalken
            sehen). Der Scraper von DataSkop - ein Softwareprogramm - besucht
            dort verschiedene Seiten und pickt bestimmte Informationen heraus.
            Dabei sucht DataSkop nach bestimmten Abschnitte im HTML-Code der
            YouTube-Webseite zu. HTML - Hypertext Markup Language - ist die
            Sprache, mit der an den Browser (Firefox, Chrome usw.) die
            Informationen über das Internet übertragen wird. Daraus berechnet
            („rendered“) der Browser dann die Darstellung der Seite. Konkret
            sieht das dann beispielsweise so aus, dass DataSkop „weiss“ zwischen
            welchen Markierungen oder Schlüsselwörter der Titel eines Videos zu
            finden ist.
          </p>
          <div>
            <img src={explainImage1} alt="" />
          </div>
          <p>
            Der Scraper von DataSkop kann aber mehr. Er kann automatisch Listen
            von Begriffen in die Suche eingeben und die Ergebnisse speichern. Er
            kann ein Video besuchen und automatisch einer bestimmten Anzahl von
            immer dem ersten vorgeschlagenen Video (auto play) aufrufen. Und
            jedesmal die ersten zehn empfohlenen Videos mit speichern.
          </p>
          <div>
            <img src={explainImage2} alt="" />
          </div>
          <p>
            Damit der Scraper nicht private Daten in deine Datenspende packt,
            sucht er auch in den Informationen zu Videos ein deinem Verlauf
            (Watch history) nach dem Hinweis „privat“ oder „ungelistet“. Wird
            dieser Marker gefunden, wird das Video in der Liste „geschwärzt“.
            Das passiert alles auf deinem Rechner. In der Datenspende später
            steht dann anstelle des Videotitels usw. Nur „privat/ungelistet“. Du
            kannst das, wenn das Scraping durchgelaufen ist, oben unter „Meine
            Daten“ betrachten.
          </p>
          <p>Weiter geht es mit der Auswertung deines YouTube-Profils.</p>
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}

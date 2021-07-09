import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import ContentWrapper from '../components/ContentWrapper';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';

export default function ResearchInfoPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const {
    state: { isScrapingFinished, demoMode },
  } = useScraping();
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
      disabled: !isScrapingFinished && !demoMode,
      tippyOptions:
        !isScrapingFinished && !demoMode
          ? {
              content: 'Bitte warte, bis alle Daten geladen sind.',
              theme: 'process-info',
              placement: 'left',
            }
          : undefined,
      clickHandler(history: RouteComponentProps['history']) {
        if (isScrapingFinished || demoMode) {
          history.push(getNextPage('path'));
        }
      },
    },
  ];

  return (
    <>
      <ContentWrapper>
        <div className="hl-4xl mb-6">Was wollen wir untersuchen?</div>
        <div className="space-y-4">
          <p>
            Nun geht es an die Experimente. Was wir genau mit diesen Daten
            vorhaben, und warum Deine Datenspende dafür von unschätzbarem Wert
            ist, möchten wir jetzt kurz erklären:
          </p>

          <p>
            Obwohl unsere Forschung nicht den „YouTube-Algorithmus“ wird
            komplett entschlüsseln können, sind wir auf Datenspenden von
            möglichst vielen echten Usern angewiesen: Denn Deine „echten“ Daten
            ermöglichen auf einzigartige Weise, YouTubes Empfehlungssystem unter
            echten Voraussetzungen zu untersuchen: So können die Ergebnisse der
            Forschung tatsächlich beanspruchen, reale Nutzungsszenarien auf der
            Plattform abzubilden.
          </p>

          <p>
            Für die nachfolgenden Experimente hat DataSkop nach Deinem Login
            vorhin bei YouTube unter Deinem Profil verschiedene, von uns
            festgelegte Suchanfragen gestartet sowie Videos aufgerufen und deren
            ersten Empfehlung gefolgt (autoplay). So können wir einen Eindruck
            darüber zu erhalten, welche verschiedenen Inhalte YouTube als
            Empfehlung auswählt und User welche Art Inhalte empfohlen bekommt.
            Das Gleiche gilt für die Ergebnisse der Suchanfragen.
          </p>

          <p>
            Inhaltlich gibt es dabei zwei Themenfelder: Nachrichteninhalte und
            Inhalte zur Bundestagswahl 2021. Dabei verfolgen wir verschiedene
            Fragen: Welche Auswahl an Nachrichtenquellen stellt YouTube durch
            sein Empfehlungssystem zusammen? Werden User überhaupt bei
            journalistischen Videos gehalten und wenn nicht: wohin führen die
            Empfehlungen?
          </p>

          <p>
            Zur Erforschung von Inhalten zur Bundestagswahl 2021 haben wir eine
            Reihe von Videos und Suchanfragen zusammengestellt, welche die
            Themenfelder der Wahl repräsentieren, wie wir sie aus
            Wahlprogrammen, journalistischen Quellen und Social Media entnommen
            haben. Dazu gehören unter anderem Suchbegriffe wie „Laschet“ und
            „Baerbock“ sowie Videos wie Rezos „Zerstörung der CDU“.
          </p>

          <p>
            Wir hoffen, dass Du die folgenden drei Experimente interessant
            findest. Viel Spaß beim Erkunden der Daten.
          </p>
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}

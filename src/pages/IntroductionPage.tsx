import { faAngleLeft, faAngleRight } from '@fortawesome/pro-solid-svg-icons';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import ContentWrapper from '../components/ContentWrapper';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useNavigation } from '../contexts/navigation';


export default function IntroductionPage(): JSX.Element {
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
      endIcon: faAngleRight,
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
      },
    },
  ];

  return (
    <>
      <ContentWrapper centerY>
        <div className="hl-4xl mb-6">
          Wahlempfehlungen: Was zeigt Dir der YouTube-Algorithmus zur
          Bundestagswahl?
        </div>
        <div className="space-y-4">
          <p>
            Willkommen beim Premierenprojekt der Datenspendeplattform DataSkop.
            In den nächsten 15 Minuten ergründen wir gemeinsam mit Dir Dein
            YouTube-Konto. Und führen einige Experimente mit dem
            Empfehlungsalgorithmus dieser Videoplattform von Google durch. 
          </p>

          <p>
            Dabei erklären und zeigen wir, warum wir die auf Dich
            zugeschnittenen Daten benötigen: Um die Rolle von Personalisierung
            im Vorschlagverfahren (recommendations) von YouTube gründlicher
            erforschen zu können. Einen Schwerpunkt legen wir dabei auf das
            Thema Bundestagswahl 2021. 
          </p>

          <p>
            Keine Sorge: Es werden ohne Deine Zustimmung keine Daten
            übermittelt.
          </p>
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}

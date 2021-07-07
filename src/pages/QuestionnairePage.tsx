import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import ContentWrapper from '../components/ContentWrapper';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useNavigation } from '../contexts/navigation';

export default function QuestionnairePage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();

  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Zurück',
      theme: 'link',
      startIcon: faAngleLeft,
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
      <ContentWrapper>
        <div className="hl-4xl mb-6">Fragebogen</div>
        <div className="space-y-4">
          <p>
            Bitte beantworte uns noch folgende Fragen. Du kannst auch manche
            Antworten frei lassen oder alle gar nichts ausfüllen. Doch wir
            möchten Dich bitten, alle Fragen zu beantworten:  Die Inforamtionen
            können uns helfen, den YT-Algorithmus besser zu verstehen.
          </p>
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}

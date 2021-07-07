import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import ContentWrapper from '../components/ContentWrapper';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useNavigation } from '../contexts/navigation';

export default function OnboardingPage1(): JSX.Element {
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
        <div className="hl-4xl mb-6 text-center">Login bei YouTube</div>
        <div className="space-y-6 text-center">
          <p>
            Als Erstes möchten wir Dich bitten, Dich bei YouTube (YT)
            anzumelden. Wir speichern Dein Passwort nicht.
          </p>
          <div>
            <div className="hl-xl mb-4">Kein YouTube-Konto?</div>
            <p>
              Wenn Du Dich nicht einloggen möchtest oder kein YT-Konto hast,
              kannst Du mit einem „Demo-Datensatz“ fortfahren. Wir fragen Dich
              am Ende noch einmal, ob Du nicht doch Daten spenden könntest, um
              unsere Untersuchung zu unterstützen.
            </p>
          </div>
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}

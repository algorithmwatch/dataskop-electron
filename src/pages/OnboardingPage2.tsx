import { faAngleLeft } from '@fortawesome/pro-solid-svg-icons';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import ContentWrapper from '../components/ContentWrapper';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { goToUrl } from '../components/scraping/ipc';
import { useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';
import { providerToMeta } from '../providers';

export default function OnboardingPage2(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const {
    state: { scrapingConfig, isScrapingStarted, isScrapingFinished },
    dispatch,
  } = useScraping();
  const resetScraping = async () => {
    await goToUrl(providerToMeta[scrapingConfig.provider].loginUrl, {
      clear: true,
    });
    dispatch({ type: 'reset-scraping' });
  };
  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Zurück',
      disabled: isScrapingStarted || isScrapingFinished,
      startIcon: faAngleLeft,
      theme: 'link',
      async clickHandler(history: RouteComponentProps['history']) {
        await resetScraping();
        setTimeout(() => {
          // logout
          history.push(getPreviousPage('path'));
        }, 0);
      },
    },
    {
      label: 'Weiter',
      classNames: 'ml-auto',
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
      },
    },
  ];

  return (
    <>
      <ContentWrapper>
        <div className="hl-4xl text-center mb-6">Anmeldung erfolgreich</div>
        <div className="hl-2xl mb-6 text-center">
          Was passiert als Nächstes?
        </div>
        <div className="space-y-4">
          <p>
            Wir zeigen Dir eine Auswertung Deiner Sehgewohnheiten und lassen
            Dich drei Experimente durchführen. Dafür:
          </p>
          <ul className="list-disc pl-4">
            <li>liest DataSkop aus, welche YT-Kanäle Du abonniert hast</li>

            <li>
              erfasst die letzten 50 Videos, die Du geschaut hast (wenn Du diese
              Funktion aktiviert hast). Private Videos werden nicht erfasst.
            </li>

            <li>
              Für die später folgenden Experimente ruft DataSkop automatisiert
              einige Videos auf und liest die dazugehörigen empfohlenen Videos
              (recommendations) aus.
            </li>

            <li>
              Automatisiert werden einige Suchbegriffe in die YouTube-Suche
              eingegeben und die ersten zehn vorgeschlagenen Ergebnisse
              gespeichert.
            </li>

            <li>
              Dann loggt Dich DataSkop aus Deinem YT-Konto automatisch aus.
            </li>
          </ul>

          <p>
            Die dabei gesammelten Daten bleiben erst einmal auf Deinem Rechner
            und werden am Ende von Dir gespendet. Aber nur wenn Du dem
            zustimmst. Für das Spenden musst Du ein DataSkop-Konto anlegen –
            dafür brauchen wir nur Deine E-Mail-Adresse.
          </p>

          <p>
            Deine gespendeten Daten werden nie für kommerzielle Zwecke
            verwendet, sondern nur für Forschung und Journalismus. Du kannst sie
            später jederzeit löschen.
          </p>
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}

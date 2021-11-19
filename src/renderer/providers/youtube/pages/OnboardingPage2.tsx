import { faAngleLeft, faAngleRight } from '@fortawesome/pro-solid-svg-icons';
import { RouteComponentProps } from 'react-router-dom';
import ContentWrapper from 'renderer/components/ContentWrapper';
import FooterNav, { FooterNavItem } from 'renderer/components/FooterNav';
import { goToUrl } from 'renderer/components/scraping/ipc';
import { useNavigation, useScraping } from 'renderer/contexts';
import { providerToMeta } from '../../';
import whatsHappening from '../static/images/start/img_was_passiert.jpg';

export default function OnboardingPage2(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const {
    state: { campaign, isScrapingStarted, isScrapingFinished },
    dispatch,
  } = useScraping();
  const resetScraping = async () => {
    if (campaign === null) return;
    await goToUrl(providerToMeta[campaign.config.provider].loginUrl, {
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
      endIcon: faAngleRight,
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
          <p>Wir zeigen dir eine Auswertung deiner Sehgewohnheiten. Dafür</p>
          <ul className="list-disc pl-4">
            <li>liest DataSkop aus, welche YT-Kanäle du abonniert hast</li>

            <li>
              und erfasst maximal die letzten 200 Videos, die du geschaut hast.
              Voraussetzung ist, dass du die Funktion in deinen
              YouTube-Einstellungen aktiviert hast, die den Verlauf speichert.
              Private Videos werden dagegen nicht gespeichert.
            </li>
          </ul>

          <div className="p-2">
            <img src={whatsHappening} alt="Teaser" height={200} />
            <div className="text-center text-sm pt-1">
              Zwei der folgenden Visualisierungen
            </div>
          </div>

          <p>Wir lassen dich drei Experimente durchführen. Dafür</p>
          <ul className="list-disc pl-4">
            <li>
              ruft DataSkop automatisiert einige Videos auf und liest die
              dazugehörigen empfohlenen Videos aus.
            </li>

            <li>
              gibt DataSkop automatisiert einige Suchbegriffe in die
              YouTube-Suche ein und speichert die ersten zehn vorgeschlagenen
              Ergebnisse.
            </li>

            <li>
              Zum Schluss loggt dich DataSkop aus deinem YT-Konto automatisch
              aus.
            </li>
          </ul>

          <p className="text-sm">
            Die von uns auf diese Weise gesammelten Daten bleiben zunächst auf
            deinem Rechner und werden erst am Ende von dir gespendet. Aber nur,
            wenn du dem zustimmst. Für das Spenden musst du ein DataSkop-Konto
            anlegen. Dafür brauchen wir lediglich deine E-Mail-Adresse.
          </p>

          <p className="text-sm">
            Deine gespendeten Daten werden nie für kommerzielle Zwecke
            verwendet, sondern nur für Forschung und Journalismus. Du kannst sie
            über dein DataSkop-Konto jederzeit löschen.
          </p>
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}

import { faAngleLeft, faAngleRight } from '@fortawesome/pro-solid-svg-icons';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useScraping } from 'renderer/contexts';
import { useNavigation } from 'renderer/contexts/navigation';
import ContentWrapper from 'renderer/providers/youtube/components/ContentWrapper';
import FooterNav, {
  FooterNavItem,
} from 'renderer/providers/youtube/components/FooterNav';
import visual from '../static/images/research-info/visual.svg';

export default function ResearchInfoPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const [nextButtonIsDisabled, setNextButtonIsDisabled] = useState(true);
  const {
    state: {
      demoMode,
      campaign,
      scrapingProgress: { step },
    },
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
      disabled: nextButtonIsDisabled && !demoMode,
      tippyOptions:
        nextButtonIsDisabled && !demoMode
          ? {
              content: 'Bitte warte, bis alle Daten geladen sind.',
              theme: 'process-info',
              placement: 'left',
            }
          : undefined,
      clickHandler(history: RouteComponentProps['history']) {
        if (!nextButtonIsDisabled || demoMode) {
          history.push(getNextPage('path'));
        }
      },
    },
  ];

  useEffect(() => {
    if (campaign === null) return;
    const stepIndex = campaign.config.steps.findIndex(
      (s) => s.type === 'video',
    );
    if (demoMode || step > stepIndex) {
      setNextButtonIsDisabled(false);
    }
  }, [step, demoMode]);

  return (
    <>
      <ContentWrapper>
        <div className="hl-4xl mb-6">Was wollen wir untersuchen?</div>
        <div className="space-y-4">
          <p>
            Nun geht es um die Experimente. Was wir genau mit deinen Daten
            vorhaben und warum deine Datenspende für uns so wertvoll ist,
            möchten wir dir hier kurz erklären:
          </p>

          <p>
            Wir sind auf Datenspenden von möglichst vielen echten Nutzerinnen
            und Nutzern angewiesen, denn eure „echten“ Daten ermöglichen auf
            einzigartige Weise, YouTubes Empfehlungssystem unter echten
            Voraussetzungen zu untersuchen. Nur so können die Ergebnisse unserer
            Forschung tatsächlich beanspruchen, reale Nutzungsszenarien auf der
            Plattform abzubilden. Einschränkend müssen wir jedoch anmerken, dass
            unsere Forschung den YouTube-Algorithmus noch nicht vollständig
            entschlüsseln wird. Wir hoffen aber mit eurer Hilfe möglichst viele
            Hinweise auf seine Funktionsweise zu finden.
          </p>

          <div className="py-6">
            <img src={visual} alt="" className="w-3/4 mx-auto block" />
          </div>

          <p>
            Für die nachfolgenden Experimente hat DataSkop nach deinem Login
            vorhin bei YouTube unter deinem Profil verschiedene, von uns
            festgelegte Suchanfragen gestartet sowie Videos aufgerufen und ist
            den Videos der Autoplay-Funktion und deren ersten Empfehlungen
            gefolgt. So können wir einen Eindruck bekommen, welche verschiedenen
            Inhalte YouTube als Empfehlung für dich auswählt. Der Vergleich mit
            anderen Datenspenden zeigt uns, welche Nutzerinnen und Nutzer welche
            Art von Inhalten empfohlen bekommen. Das Gleiche gilt für die
            Ergebnisse der Suchanfragen.
          </p>

          <p>
            Inhaltlich untersuchen wir dabei zwei Themenfelder:
            Nachrichteninhalte und Inhalte zur Bundestagswahl 2021. Dabei
            verfolgen wir verschiedene Fragen: Welche Auswahl an
            Nachrichtenquellen stellt YouTube durch sein Empfehlungssystem
            zusammen? Werden Nutzerinnen und Nutzer bei journalistischen Videos
            gehalten? Falls nicht: Wohin führen die Empfehlungen?
          </p>

          <p>
            Wir haben aus Wahlprogrammen, journalistischen Quellen und Social
            Media eine Reihe von Videos und Suchanfragen zusammengestellt, die
            Themenfelder der Bundestagswahl 2021 repräsentieren. Dazu gehören
            unter anderem Suchbegriffe wie „Laschet“ und „Baerbock“ sowie Videos
            wie Rezos „Zerstörung der CDU“.
          </p>

          <p>
            Wir hoffen, dass du die folgenden drei Experimente interessant
            findest. Viel Spaß dabei.
          </p>

          <p className="border border-yellow-700 p-4">
            <strong>Hinweis:</strong> Es kann sein, dass du noch einige Minuten
            warten musst, bis die Daten ausgelesen sind. Per Klick auf den
            Ladebalken oben kannst du sehen, was DataSkop bei YouTube gerade
            macht.
          </p>
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}

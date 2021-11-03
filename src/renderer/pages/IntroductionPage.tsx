import { faAngleLeft, faAngleRight } from '@fortawesome/pro-solid-svg-icons';
import { RouteComponentProps } from 'react-router-dom';
import ContentWrapper from '../components/ContentWrapper';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useNavigation } from '../contexts/navigation';
import visual from '../static/images/start/visual.svg';

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
          Wahlempfehlungen: Was zeigt dir der YouTube-Algorithmus zur
          Bundestagswahl?
        </div>
        <div className="space-y-4">
          <p className="hl-xl">
            Hinweis: Es können keine Daten mehr gespendet werden – die Software
            kann aber weiterhin vollumfänglich genutzt werden.
          </p>

          <p>
            Willkommen beim Premierenprojekt der Datenspendeplattform DataSkop!
            In den nächsten 15 Minuten ergründen wir gemeinsam mit dir dein
            YouTube-Konto und führen einige Experimente mit dem
            Empfehlungsalgorithmus dieser Videoplattform von Google durch.
          </p>

          <p>
            Wir bitten dich um deine auf dich zugeschnittenen Daten, weil wir
            sie benötigen, um die Rolle von Personalisierung im
            Vorschlagverfahren (Englisch: „recommendations“) von YouTube
            gründlicher erforschen zu können. Einen Schwerpunkt legen wir dabei
            auf das Thema Bundestagswahl 2021.
          </p>

          <p>
            Die Daten werden unter strengen Datenschutzanforderungen von
            Wissenschaftler*innen der Europa-Universität Viadrina (Frankfurt O.)
            und Journalist*innen von DER SPIEGEL ausgewertet.
          </p>

          <p>
            Keine Sorge: Es werden ohne deine Zustimmung keine Daten an uns
            übermittelt!
          </p>
        </div>
        <div className="mt-8">
          <img src={visual} alt="" className="w-11/12" />
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}

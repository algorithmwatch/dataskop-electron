import { faAngleLeft, faAngleRight } from '@fortawesome/pro-solid-svg-icons';
import { Link, RouteComponentProps } from 'react-router-dom';
import ContactContainer from 'renderer/components/ContactContaier';
import ContentWrapper from 'renderer/components/ContentWrapper';
import FooterNav, { FooterNavItem } from 'renderer/components/FooterNav';
import { useScraping } from 'renderer/contexts';
import { useNavigation } from 'renderer/contexts/';
import VisualizationWrapper from '../components/VisualizationWrapper';
import routes from '../lib/routes';

export default function MyDataPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const {
    state: { demoMode },
  } = useScraping();

  // FIXME: all donations are disabled right now
  const noMoreDonations = true;

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
      disabled: demoMode || noMoreDonations,
      tippyOptions:
        demoMode || noMoreDonations
          ? {
              content: !demoMode
                ? 'Es können aktuell keine Daten mehr gespendet werden.'
                : 'Die Demo ist hier zu Ende',
              theme: 'process-info',
              placement: 'left',
            }
          : undefined,
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
      },
    },
  ];

  return (
    <>
      {demoMode ? (
        <ContentWrapper centerY>
          <div className="text-center space-y-4 max-w-md">
            <div className="hl-3xl">Die Demo ist hier zu Ende</div>
            <p>
              <span className="line-through">
                Wenn Du Dataskop mit einer Datenspende unterstützen möchtest,
              </span>{' '}
              <Link
                to={routes.ONBOARDING_1.path}
                className="underline hover:no-underline text-blue-600"
              >
                melde Dich bitte mit deinem YouTube-Konto an
              </Link>
              .
            </p>
            <p>
              Hinweis: Es können keine Daten mehr gespendet werden – die
              Software kann aber weiterhin vollumfänglich genutzt werden.
            </p>
            <ContactContainer />
          </div>
        </ContentWrapper>
      ) : (
        <VisualizationWrapper name="mydata" />
      )}
      <FooterNav items={footerNavItems} />
    </>
  );
}

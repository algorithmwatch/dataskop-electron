/**
 * Select a campaign configuration.
 *
 * @module
 */
import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import FooterNav, { FooterNavItem } from 'renderer/components/FooterNav';
import { useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';

export default function SelectCampaignPage(): JSX.Element {
  const {
    state: { availableCampaigns },
    dispatch,
  } = useScraping();

  const {
    getNextPage,
    getPreviousPage,
    dispatch: navDispath,
  } = useNavigation();

  const [chosenIndex, setChosenIndex] = useState(0);

  useEffect(() => {
    if (!availableCampaigns.length) return;

    const campaign = availableCampaigns[chosenIndex];
    dispatch({
      type: 'set-campaign',
      campaign,
    });

    navDispath({
      type: 'set-navigation-by-provider',
      provider: campaign.config.provider,
    });
  }, [chosenIndex]);

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
      <div className="mx-auto flex flex-col h-full">
        <div className="hl-4xl mb-6 text-center">Wähle aus</div>
        <div className="text-center">
          {availableCampaigns.map((x, i) => {
            const border =
              i === chosenIndex
                ? 'border-solid border-4 border-yellow-700'
                : 'border-solid border-4 border-yellow-300';
            return (
              <div
                key={i}
                className={`${border} p-5 mt-5 cursor-pointer`}
                onClick={() => setChosenIndex(i)}
              >
                <div className="hl-xl">{x.title}</div>
                <div>{x.description}</div>
              </div>
            );
          })}
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}

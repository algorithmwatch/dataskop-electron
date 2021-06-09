import React, { useState } from 'react';
import { RouteComponentProps, useLocation } from 'react-router-dom';
import Explainer from '../components/Explainer';
import FooterNav from '../components/FooterNav';
import NewsTop5 from '../components/visualizations/NewsTop5';
import routes from '../constants/routes.json';

export default function VisualizationExperimentsPage(): JSX.Element {
  const [explainerIsOpen, setExplainerIsOpen] = useState(true);
  const { state } = useLocation();
  const { sessionId, type }: { sessionId: string; type: string } = state;

  if (!sessionId || !type) return null;

  // const [data, setData] = useState<any>([]);
  // const {
  //   state: { isDebug },
  // } = useConfig();

  // useEffect(() => {
  //   const loadData = async () => {
  //     setData(await getSessionData(sessionId));
  //   };
  //   loadData();
  // }, [sessionId]);

  // if (isDebug) {
  //   console.log(data);
  // }

  const footerNavItems = [
    {
      label: 'weiter zu Donation',
      classNames: 'ml-auto',
      clickHandler(history: RouteComponentProps['history']) {
        history.push(routes.DONATION);
      },
    },
  ];

  return (
    <>
      <Explainer
        isOpen={explainerIsOpen}
        onIsOpenChange={(val: boolean) => setExplainerIsOpen(val)}
      >
        Hallo haha
      </Explainer>
      {type === 'newstop5' && <NewsTop5 />}
      <FooterNav items={footerNavItems} />
    </>
  );
}

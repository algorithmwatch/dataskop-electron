import React from 'react';
import { RouteComponentProps, useParams } from 'react-router-dom';
import FooterNav from '../components/FooterNav';
import ResultsDetails from '../components/results/ResultDetails';
import routes from '../router/constants.json';

export default function VisualizationProfilePage(): JSX.Element {
  const { sessionId }: { sessionId: string } = useParams();

  const footerNavItems = [
    {
      label: 'weiter zu Exp scraping',
      clickHandler(history: RouteComponentProps['history']) {
        history.push(routes.SCRAPING_EXPERIMENT);
      },
    },
  ];

  return (
    <>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio
      molestiae laboriosam adipisci odio molestias eligendi, illo fugit ad
      impedit repellendus nulla beatae unde quasi eaque ea consequatur
      recusandae velit necessitatibus!
      <ResultsDetails sessionId={sessionId} />
      <FooterNav items={footerNavItems} />
    </>
  );
}

import React from 'react';
import { useParams } from 'react-router-dom';
import ResultsDetails from '../components/results/ResultDetails';
import routes from '../constants/routes.json';
import SlideBase from '../layout/SlideBase';

export default function VisualizationProfilePage(): JSX.Element {
  const { sessionId }: { sessionId: string } = useParams();

  const footerNav = [
    {
      label: 'weiter zu Exp scraping',
      clickHandler: (x) => x.push(routes.SCRAPING_EXPERIMENT),
    },
  ];

  return (
    <SlideBase footerNav={footerNav}>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio
      molestiae laboriosam adipisci odio molestias eligendi, illo fugit ad
      impedit repellendus nulla beatae unde quasi eaque ea consequatur
      recusandae velit necessitatibus!
      <ResultsDetails sessionId={sessionId} />
    </SlideBase>
  );
}

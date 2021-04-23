import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ResultsDetails from '../components/results/ResultDetails';
import routes from '../constants/routes.json';

export default function ResultsDetailsPage() {
  const { sessionId }: { sessionId: string } = useParams();
  return (
    <>
      <Link
        className="underline text-2xl"
        to={routes.VISUALIZATION_ADVANCED.replace(':sessionId', sessionId)}
      >
        Show Visualizations
      </Link>
      <ResultsDetails sessionId={sessionId} />
    </>
  );
}

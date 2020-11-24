import React from 'react';
import { useParams } from 'react-router-dom';
import VisualizationDetails from '../components/VisualizationDetails';

export default function VisualizationDetailsPage() {
  const { sessionId } = useParams();
  return <VisualizationDetails sessionId={sessionId} />;
}

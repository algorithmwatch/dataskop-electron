import React from 'react';
import { useHistory } from 'react-router-dom';
import Button from '../components/Button';
import routes from '../constants/routes.json';
import SlideBase from '../layout/SlideBase';

export default function ScrapingExplanationPage(): JSX.Element {
  const history = useHistory();
  const showExplainer = () => {
    alert('Here comes the explainer!');
  };

  return (
    <SlideBase>
      <h1 className="hl-4xl text-center mb-6">Bereit zum Loslegen?</h1>
      <p className="text-lg mx-auto mb-8">
        Als nächstes werden wir Dein YouTube-Profil scrapen.
      </p>
      <div className="mx-auto flex flex-col space-y-4">
        <Button
          size="large"
          clickHandler={() => history.push(routes.SCRAPING_PROFILE)}
        >
          Scraping starten
        </Button>
        <Button size="large" clickHandler={showExplainer}>
          Was ist Scraping?
        </Button>
      </div>
    </SlideBase>
  );
}

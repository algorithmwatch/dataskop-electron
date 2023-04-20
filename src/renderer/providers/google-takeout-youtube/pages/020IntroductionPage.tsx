/**
 * Text-heavy introductory page
 *
 * @module
 */

import ContentPage from "../../../pages/ContentPage";

const IntroductionPage = (): JSX.Element => {
  return (
    <ContentPage title="Visualisiere deine YouTube-Daten">
      <div className="space-y-6 text-xl max-w-prose">
        <p>
          YouTube sammelt viele Daten über dich. Weißt du auch welche? <br />
          Sogenannte personenbezogene Daten („DSGVO-Daten“) lassen Rückschlüsse
          auf die Persönlichkeit oder Lebensführung zu. Doch den Nutzer*innen
          großer Plattformen wie YouTube ist oft unklar, welche Daten das sind.
        </p>

        <p>
          Mit der DataSkop-App wollen wir gemeinsam mit dir untersuchen, welche
          Daten YouTube über dich erhebt.
        </p>
      </div>
    </ContentPage>
  );
};

export default IntroductionPage;

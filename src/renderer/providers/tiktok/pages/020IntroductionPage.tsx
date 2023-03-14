/**
 * Text-heavy introductory page
 *
 * @module
 */

import ContentPage from "../../../pages/ContentPage";

const IntroductionPage = (): JSX.Element => {
  return (
    <ContentPage title="Willkommen bei DataSkop 👋">
      <div className="space-y-6 text-xl max-w-prose">
        <p>
          TikTok sammelt viele Daten über dich. Weißt du auch welche? <br />
          Sogenannte personenbezogene Daten („DSGVO-Daten“) lassen Rückschlüsse
          auf die Persönlichkeit oder Lebensführung zu. Doch den Nutzer*innen
          großer Plattformen wie TikTok ist oft unklar, welche Daten das sind.
        </p>

        <p>
          Mit der DataSkop-App wollen wir gemeinsam mit dir untersuchen, welche
          Daten TikTok über dich erhebt.
        </p>

        <p>
          Am Ende hast du die Möglichkeit, uns diese Daten zu spenden. Darüber
          würden wir uns sehr freuen, denn mit deiner Datenspende tust du etwas
          Gutes für die Wissenschaft.
        </p>
      </div>
    </ContentPage>
  );
};

export default IntroductionPage;

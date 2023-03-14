import ImportPage from "../../../pages/ImportPage";

const TikTokImportPage = (): JSX.Element => {
  return (
    <ImportPage
      previousPath="/tiktok/before_login"
      nextPath="/tiktok/waiting"
      description="Wenn du die DSGVO-Daten auf TikTok bereits beantragt und den
      Datenexport heruntergeladen hast, kannst du ihn hier einfügen. Die
      DSGVO-Daten werden dann nicht erneut beantragt."
    />
  );
};

export default TikTokImportPage;

import ImportPage from "../../../pages/ImportPage";

const GTYoutubeImportPage = (): JSX.Element => {
  return (
    <ImportPage
      previousPath="/google-takeout-youtube/intro"
      nextPath="/google-takeout-youtube/waiting"
      description="Lorem Lorem Lorem"
      clearImportsOnClose
    />
  );
};

export default GTYoutubeImportPage;

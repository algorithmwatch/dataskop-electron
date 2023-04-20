import WaitingPage from "../../../pages/WaitingPage";
import StatusSwitch from "../components/StatusSwitch";

const GTYoutubeWaitingPage = (): JSX.Element => {
  return (
    <WaitingPage surveyQuestions={[]} StatusSwitchComponent={StatusSwitch} />
  );
};

export default GTYoutubeWaitingPage;

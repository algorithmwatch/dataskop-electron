import WaitingPage from "../../../pages/WaitingPage";
import StatusSwitch from "../../tiktok/components/StatusSwitch";

const GTYoutubeWaitingPage = (): JSX.Element => {
  return (
    <WaitingPage surveyQuestions={[]} StatusSwitchComponent={StatusSwitch} />
  );
};

export default GTYoutubeWaitingPage;

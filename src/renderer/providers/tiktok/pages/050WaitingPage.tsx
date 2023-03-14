/**
 * Manage different waiting situations for TikTok
 *
 * @module
 */

import { QuestionTypes } from "../../../components/survey/context/types";
import WaitingPage from "../../../pages/WaitingPage";
import StatusSwitch from "../components/StatusSwitch";
import surveyQuestions from "../static/survey-questions.json";

const TikTokWaitingPage = (): JSX.Element => {
  return (
    <WaitingPage
      surveyQuestions={surveyQuestions.questions as QuestionTypes[]}
      StatusSwitchComponent={StatusSwitch}
    />
  );
};

export default TikTokWaitingPage;

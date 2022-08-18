/**
 * TODO: For TikTok
 *
 * @module
 */
import { useHistory } from "react-router";
import { useNavigation } from "../../../contexts";
// import FooterNav, {

export default function IntroductionPage(): JSX.Element {
  const { getNextPage } = useNavigation();
  const history = useHistory();

  const hadnleNextClick = () => {
    history.push(getNextPage("path"));
  };

  return (
    <>
      <div className="grow mx-auto flex flex-col h-full min-h-0">
        I am the intro page.
      </div>
    </>
  );
}

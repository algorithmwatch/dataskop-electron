import { faSpinnerThird } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useScraping } from "renderer/contexts";

const ScrapingProgressBar = () => {
  const {
    state: {
      campaign,
      scrapingProgress: { step },
    },
  } = useScraping();

  const etaMin = "wenige Minuten";

  const typeDescriptionMap = {
    action: "Scraping Profil",
    profile: "Scraping Profil",
    video: "Empfehlungsexperimente…",
    search: "Suchexperiment…",
  };
  const currentType = campaign?.config.steps[step]
    .type as keyof typeof typeDescriptionMap;

  const description = typeDescriptionMap[currentType];

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="mx-auto flex flex-col h-full">
      <div className="flex-grow flex items-center">
        <div className="z-20 flex items-center space-x-2 text-yellow-1300 group-hover:text-yellow-1100  backdrop-filter backdrop-contrast-125 cursor-wait p-10 shadow rounded-lg">
          <FontAwesomeIcon icon={faSpinnerThird} spin size="4x" className="" />
          <div className="pl-3 items-left">
            <div className="text-xl">{description}</div>
            <div className="text-xs">{etaMin}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapingProgressBar;

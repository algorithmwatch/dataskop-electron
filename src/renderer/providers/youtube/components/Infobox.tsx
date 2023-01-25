import { faLightbulb, IconDefinition } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode } from "react";

const Infobox = ({
  icon = faLightbulb,
  classname = "",
  children,
}: {
  icon?: IconDefinition;
  classname?: string;
  children: ReactNode;
}) => {
  return (
    <div className={`flex border-2 border-blue-200 px-5 py-5 ${classname}`}>
      <div className="mr-5 mt-1.5 text-blue-400">
        <FontAwesomeIcon icon={icon} size="3x" />
      </div>
      <div>{children}</div>
    </div>
  );
};

export default Infobox;

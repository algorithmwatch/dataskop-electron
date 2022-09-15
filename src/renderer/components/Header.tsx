/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { faBars } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHistory } from "react-router";
import { useConfig } from "renderer/contexts";
import logo from "renderer/providers/tiktok/static/images/bildmarke.svg";

const ToggleMenuButton = ({ toggle }: { toggle: () => void }) => {
  return (
    <button type="button" className="mr-2 pointer-events-auto" onClick={toggle}>
      <FontAwesomeIcon icon={faBars} size="2x" />
    </button>
  );
};

export default function Header({ toggleMenu }: { toggleMenu: () => void }) {
  const {
    state: { version },
  } = useConfig();
  const history = useHistory();

  return (
    <>
      <header className="fixed z-10 pointer-events-none inset-x-0 top-0 p-4 flex justify-between items-center">
        {/* Logo */}
        <div className="relative">
          <img
            src={logo}
            alt="Dataskop Logo"
            className="w-[52px] pointer-events-auto"
            onClick={() =>
              process.env.NODE_ENV === "development"
                ? history.push("/")
                : undefined
            }
          />
          {version && version.includes("beta") && (
            <div className="absolute -right-full top-2.5 text-sm bg-gray-200 px-1.5 py-0.5 text-gray-600">
              Beta
            </div>
          )}
        </div>

        <ToggleMenuButton toggle={toggleMenu} />
      </header>
    </>
  );
}

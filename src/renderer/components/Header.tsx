import { faBars } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useConfig } from "renderer/contexts";
import logo from "renderer/providers/tiktok/static/images/bildmarke.svg";

const ToggleMenuButton = ({ toggle }: { toggle: () => void }) => {
  return (
    <button type="button" className="mr-1" onClick={toggle}>
      <FontAwesomeIcon icon={faBars} size="2x" />
    </button>
  );
};

export default function Header({ toggleMenu }: { toggleMenu: () => void }) {
  const {
    state: { version },
  } = useConfig();

  return (
    <>
      <header className="p-4 flex justify-between items-center">
        <div className="relative">
          <img src={logo} alt="Dataskop Logo" className="w-[52px]" />
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

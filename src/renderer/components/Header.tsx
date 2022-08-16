import { faBars } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useLocation } from "react-router";
import Drawer from "renderer/components/Drawer";
import { useConfig, useNavigation } from "renderer/contexts";
import logo from "renderer/providers/tiktok/static/images/bildmarke.svg";

export default function Header() {
  const { pathname } = useLocation();
  const {
    state: { version },
  } = useConfig();
  const { getCurrentPage } = useNavigation();
  const showHeader = getCurrentPage("layoutProps")?.showHeader || true;
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  return (
    <>
      <header className="p-4">
        {showHeader && (
          <img src={logo} alt="Dataskop Logo" className="w-[52px]" />
        )}
        {/* {version && version.includes('beta') && (
        <div className="ml-3 text-sm bg-yellow-300 px-1.5 py-0.5 text-yellow-1300">
          Beta
        </div>
      )} */}
        <div>
          <button
            type="button"
            // className="text-3xl"
            onClick={() => setMenuIsOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} size="2x" />
          </button>
        </div>
      </header>
      <Drawer
        title="Testtitle"
        isOpen={menuIsOpen}
        setIsOpen={(val) => setMenuIsOpen(val)}
      >
        Das sind die Kinder
      </Drawer>
    </>
  );
}

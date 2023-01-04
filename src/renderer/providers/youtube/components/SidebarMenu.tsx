/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { IconDefinition } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { useState } from "react";
import AdminMenu from "renderer/components/admin/AdminMenu";
import { useConfig, useScraping } from "renderer/contexts";
import { clearData } from "renderer/lib/db";

const SidebarMenu = ({
  menuItems = [],
  isOpen = false,
  onIsOpenChange,
}: {
  menuItems: {
    label: string;
    icon: IconDefinition;
    onClick: () => void;
  }[];
  isOpen?: boolean;
  onIsOpenChange: (value: boolean) => void;
}): JSX.Element | null => {
  const {
    state: { version, showAdvancedMenu },
    dispatch,
  } = useConfig();
  const { dispatch: scrapingDispatch } = useScraping();

  // click the version to unlock the advanced menu
  const [versionClicked, setVersionClicked] = useState(0);
  const handleversionClicked = () => {
    if (versionClicked > 2) {
      dispatch({ type: "show-advanced-menu" });
    } else setVersionClicked(versionClicked + 1);
  };

  const sidebarClasses = classNames({
    "w-80 fixed inset-y-0 bg-yellow-300 z-50": true,
    "transition-all duration-200 ease-in-out": true,
    "flex flex-col justify-between": true,
    "-right-80": !isOpen,
    "right-0": isOpen,
  });

  return (
    <div>
      <div className={sidebarClasses}>
        {/* main menu */}
        <div className="px-8 mt-16 flex flex-col space-y-6 items-start">
          {menuItems.map(({ label, icon, onClick }) => (
            <button
              key={label}
              type="button"
              className="flex text-yellow-1500 text-lg focus:outline-none hover:text-yellow-1200"
              onClick={onClick}
            >
              {icon && (
                <span className="w-6 mr-3">
                  <FontAwesomeIcon icon={icon} size="lg" />
                </span>
              )}
              <span className="font-bold">{label}</span>
            </button>
          ))}

          <div className="border border-yellow-900/50 text-sm text-yellow-1300 p-3">
            <strong>Hast Du technische Probleme?</strong> Schreibe eine Mail an{" "}
            <a
              href="mailto:support@dataskop.net"
              className="underline hover:no-underline"
            >
              support@dataskop.net
            </a>
            .
          </div>
        </div>

        {/* footer menu */}
        <div className="pl-8 mb-4 relative">
          {showAdvancedMenu && (
            <div className="absolute right-8 bottom-0">
              <AdminMenu
                onItemClicked={() => onIsOpenChange(false)}
                menuItems={[
                  { label: "Start YouTube", to: "/select_campaign/youtube" },
                  { label: "Start TikTok", to: "/select_campaign/tiktok" },
                  {
                    label: "Advanced scraping",
                    to: "/admin/scraping/advanced",
                  },
                  {
                    label: "Scraping config editor",
                    to: "/admin/scraping/editor",
                  },
                  { label: "Results", to: "/admin/results" },
                  { label: "Settings", to: "/admin/settings" },
                  {
                    label: "Reset scraping window",
                    click: () => {
                      window.electron.ipc.invoke("scraping-clear-storage");
                      scrapingDispatch({ type: "reset-scraping" });
                    },
                  },
                  {
                    label: "Clear results and sessions",
                    click: () => {
                      clearData();
                    },
                  },
                ]}
              />
            </div>
          )}

          <div
            className="text-sm text-yellow-1100"
            onClick={handleversionClicked}
          >
            DataSkop
            <br />
            Version: {version}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          tabIndex={-1}
          className="absolute inset-0 bg-yellow-1400/50 z-40"
          onClick={() => onIsOpenChange(false)}
        />
      )}
    </div>
  );
};

export default SidebarMenu;

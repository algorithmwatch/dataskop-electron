/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  faArrowRotateBack,
  faFileContract,
  faPaperPlane,
  faQuestionCircle,
  faUserSecret,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import AdminMenu from "renderer/components/admin/AdminMenu";
import Drawer from "renderer/components/Drawer";
import { useConfig, useScraping } from "renderer/contexts";
import { clearData } from "renderer/lib/db";
import { delay } from "renderer/lib/utils/time";
import tiktokRoutes from "renderer/providers/tiktok/lib/routes";
import { Button } from "./Button";
import Modal from "./Modal";

const SidebarMenu = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) => {
  const {
    state: { version, showAdvancedMenu },
    dispatch: configDispatch,
  } = useConfig();
  const { dispatch: scrapingDispatch } = useScraping();
  const history = useHistory();

  const [modal1IsOpen, setModal1IsOpen] = useState(false);

  // click the version to unlock the advanced menu
  const [versionClicked, setVersionClicked] = useState(0);
  const handleversionClicked = () => {
    if (versionClicked > 2) {
      configDispatch({ type: "show-advanced-menu" });
    } else setVersionClicked(versionClicked + 1);
  };

  const menuItems = [
    {
      label: "FAQ",
      icon: faQuestionCircle,
      onClick: () => {
        window.open("https://dataskop.net/faq/");
      },
    },
    // {
    //   label: "Über",
    //   icon: faInfoCircle,
    //   onClick: () => {
    //     window.open("https://dataskop.net/ueber/");
    //   },
    // },
    {
      label: "Kontakt",
      icon: faPaperPlane,
      onClick: () => {
        window.open("https://dataskop.net/kontakt/");
      },
    },
    {
      label: "Datenspende-Vertrag",
      icon: faFileContract, // faFileSignatur
      onClick: () => {
        window.open("https://dataskop.net/datenspendevertrag/");
      },
    },
    {
      label: "Datenschutz",
      icon: faUserSecret,
      onClick: () => {
        window.open("https://dataskop.net/datenschutzerklaerung/");
      },
    },
    {
      label: "Zurücksetzen",
      icon: faArrowRotateBack,
      onClick: () => {
        setModal1IsOpen(true);
      },
    },
  ];

  return (
    <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
      <Modal
        theme="tiktok"
        isOpen={modal1IsOpen}
        closeModal={() => setModal1IsOpen(false)}
        buttons={[
          <Button
            theme="outline"
            className="mr-5"
            onClick={() => setModal1IsOpen(false)}
          >
            Schließen
          </Button>,
          <Button
            onClick={async () => {
              await clearData();
              await window.electron.ipc.invoke("scraping-clear-storage");
              await scrapingDispatch({ type: "reset-scraping" });
              await delay(1000);
              window.electron.ipc.invoke("restart");
            }}
          >
            Zurücksetzen
          </Button>,
        ]}
      >
        <div className="text-center">
          <h1 className="hl-2xl mb-4">Willst du DataSkop zurücksetzen?</h1>
          <p className="">
            Du kannst DataSkop zurücksetzen, um dich z. B. aus deinem Account
            auszuloggen. Anschließend kannst du dich neu anmelden oder Daten
            importieren.
          </p>
        </div>
      </Modal>
      <div className="flex flex-col h-full justify-between">
        {/* main menu */}
        <div className="px-8 mt-16 flex flex-col space-y-6 items-start">
          {menuItems.map(({ label, icon, onClick }) => (
            <button
              key={label}
              type="button"
              className="flex text-lg hover:text-sky-700"
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

          <div className="border border-black/50 text-sm text-gray-600 p-3">
            <strong>Hast du technische Probleme?</strong> Schreibe eine Mail an{" "}
            <a
              href="mailto:support@dataskop.net"
              className="underline hover:no-underline"
            >
              support@dataskop.net
            </a>{" "}
            und exportiere ein Archiv deiner Daten{" "}
            <span
              className="hover:cursor-pointer underline"
              onClick={() => {
                window.electron.ipc.invoke("export-debug-archive");
              }}
            >
              hier
            </span>
            .
          </div>
        </div>

        {/* footer menu */}
        <div className="pl-8 mb-4 relative">
          {showAdvancedMenu && (
            <div className="absolute right-8 bottom-0">
              <AdminMenu
                onItemClicked={() => setIsOpen(false)}
                menuItems={[
                  { label: "Start TikTok", to: "/select_campaign/tiktok" },
                  { label: "Start YouTube", to: "/select_campaign/youtube" },
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
              <AdminMenu
                menuLabel="TikTok pages"
                onItemClicked={() => setIsOpen(false)}
                menuItems={tiktokRoutes.map(({ path }) => ({
                  label: path,
                  to: path,
                }))}
              />
            </div>
          )}

          <div className="text-sm text-gray-600" onClick={handleversionClicked}>
            DataSkop
            <br />
            Version: {version}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default SidebarMenu;

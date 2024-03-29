import {
  faBars,
  faFileContract,
  faInfoCircle,
  faPaperPlane,
  faUserSecret,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import logo from "renderer/static/images/logos/dslogo.svg";
import { useConfig, useNavigation, useScraping } from "../../../contexts";
import Modal from "./Modal";
import { ModalProvider, useModal } from "./modal/context";
import ProcessIndicator from "./ProcessIndicator";
import ScrapingProgressBar from "./ScrapingProgressBar";
import SidebarMenu from "./SidebarMenu";

const BaseLayoutInner = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [sectionKey, setSectionKey] = useState("");
  const { pathname } = useLocation();
  const {
    state: { pageIndex, sections },
    getCurrentPage,
  } = useNavigation();
  const { dispatch: dispatchModal } = useModal();
  const {
    state: { demoMode, userWasForcefullyLoggedOut },
  } = useScraping();
  const {
    state: { version },
  } = useConfig();
  const sidebarMenu = [
    {
      label: "Über",
      icon: faInfoCircle,
      onClick: () => {
        dispatchModal({
          type: "set-modal-options",
          options: { isOpen: true, componentName: "about" },
        });
      },
    },
    {
      label: "Kontakt",
      icon: faPaperPlane,
      onClick: () => {
        dispatchModal({
          type: "set-modal-options",
          options: { isOpen: true, componentName: "contact" },
        });
      },
    },
    {
      label: "Datenspendevertrag",
      icon: faFileContract,
      onClick: () => {
        dispatchModal({
          type: "set-modal-options",
          options: { isOpen: true, componentName: "terms" },
        });
      },
    },
    {
      label: "Datenschutz",
      icon: faUserSecret,
      onClick: () => {
        dispatchModal({
          type: "set-modal-options",
          options: { isOpen: true, componentName: "privacy" },
        });
      },
    },
  ];

  // set dark mode, set process indicator
  useEffect(() => {
    const page = getCurrentPage();

    // set processIndicator
    if (typeof page.sectionKey !== "undefined") {
      if (page.sectionKey === null) {
        setSectionKey("");
      } else {
        setSectionKey(page.sectionKey);
      }
    }
  }, [pageIndex]);

  useEffect(() => {
    if (userWasForcefullyLoggedOut) {
      dispatchModal({
        type: "set-modal-options",
        options: { isOpen: true, componentName: "logout" },
      });
    }
  }, [userWasForcefullyLoggedOut]);

  return (
    <div className="relative flex flex-col h-screen justify-between bg-yellow-100 bg-[url('renderer/providers/youtube/static/images/bg.png')] bg-[length:90%] dark:bg-blue-900 overflow-hidden text-yellow-1500">
      <Modal />
      <header
        className={clsx("flex items-center py-4 px-6 z-20 h-[4.375rem]", {
          "opacity-0": pathname === "/youtube/start",
        })}
      >
        <div>
          <img src={logo} style={{ width: "8rem" }} alt="Dataskop Logo" />
        </div>
        {version && version.includes("beta") && (
          <div className="ml-3 text-sm bg-yellow-300 px-1.5 py-0.5 text-yellow-1300">
            Beta
          </div>
        )}
        {demoMode && (
          <div className="ml-3 text-sm bg-yellow-300 px-1.5 py-0.5 text-yellow-1300">
            Demo-Modus
          </div>
        )}
        <div className="flex items-center ml-auto mr-6">
          <div className="mr-4">
            <ScrapingProgressBar />
          </div>
        </div>
        <div>
          <button
            type="button"
            className="focus:outline-none text-yellow-800 hover:text-yellow-900"
            onClick={() => setMenuIsOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>
        </div>
      </header>

      <SidebarMenu
        menuItems={sidebarMenu}
        isOpen={menuIsOpen}
        onIsOpenChange={(val: boolean) => setMenuIsOpen(val)}
      />

      <div className="absolute inset-x-0 bottom-0 py-12 bg-gradient-to-b	from-transparent to-yellow-100" />

      <main className="flex flex-grow flex-col justify-between overflow-auto pt-4 pb-2">
        {children}
      </main>

      <footer className="fixed bottom-0 inset-x-0 z-10">
        <ProcessIndicator steps={sections} currentStep={sectionKey} />
      </footer>
    </div>
  );
};

const BaseLayout = ({ children }) => (
  <ModalProvider>
    <BaseLayoutInner>{children}</BaseLayoutInner>
  </ModalProvider>
);

export default BaseLayout;

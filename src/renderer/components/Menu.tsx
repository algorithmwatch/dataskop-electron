import {
  faFileContract,
  faInfoCircle,
  faPaperPlane,
  faUserSecret,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AdvancedMenu from "renderer/components/admin/AdvancedMenu";
import Drawer from "renderer/components/Drawer";
import { useConfig } from "renderer/contexts";

export const Menu = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) => {
  const {
    state: { version, showAdvancedMenu },
  } = useConfig();

  const menuItems = [
    {
      label: "Über",
      icon: faInfoCircle,
      onClick: () => {
        // dispatchModal({
        //   type: "set-modal-options",
        //   options: { isOpen: true, componentName: "about" },
        // });
      },
    },
    {
      label: "Kontakt",
      icon: faPaperPlane,
      onClick: () => {
        // dispatchModal({
        //   type: "set-modal-options",
        //   options: { isOpen: true, componentName: "contact" },
        // });
      },
    },
    // {
    //   label: 'FAQ',
    //   icon: faQuestionCircle,
    //   onClick: () => {
    //     dispatchModal({
    //       type: 'set-modal-options',
    //       options: { isOpen: true, componentName: 'faq' },
    //     });
    //   },
    // },
    {
      label: "Datenspende-Vertrag",
      icon: faFileContract, // faFileSignatur
      onClick: () => {
        // dispatchModal({
        //   type: "set-modal-options",
        //   options: { isOpen: true, componentName: "terms" },
        // });
      },
    },
    {
      label: "Datenschutz",
      icon: faUserSecret,
      onClick: () => {
        // dispatchModal({
        //   type: "set-modal-options",
        //   options: { isOpen: true, componentName: "privacy" },
        // });
      },
    },
  ];

  return (
    <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
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
              <AdvancedMenu
                onItemClicked={() => setIsOpen(false)}
                menuItems={[
                  { label: "Start TikTok", to: "/tt/start" },
                  { label: "Start YouTube", to: "/yt/start" },
                  {
                    label: "advanced scraping",
                    to: "/admin/scraping/advanced",
                  },
                  {
                    label: "scraping config editor",
                    to: "/admin/scraping/editor",
                  },
                  { label: "results", to: "/admin/results" },
                  { label: "settings", to: "/admin/settings" },
                ]}
              />
            </div>
          )}

          <div className="text-sm text-gray-600">
            DataSkop
            <br />
            Version: {version}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

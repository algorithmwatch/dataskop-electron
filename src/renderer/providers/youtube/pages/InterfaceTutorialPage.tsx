import { faMousePointer } from "@fortawesome/pro-light-svg-icons";
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useNavigation, useScraping } from "renderer/contexts";
import FooterNav, {
  FooterNavItem,
} from "renderer/providers/youtube/components/FooterNav";
import { PerfectArrow } from "renderer/providers/youtube/components/PerfectArrow";

export default function InterfaceTutorialPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const {
    state: { isScrapingStarted, isUserLoggedIn, demoMode },
    dispatch,
  } = useScraping();

  const footerNavItems: FooterNavItem[] = [
    {
      label: "Zurück",
      startIcon: faAngleLeft,
      theme: "link",
      clickHandler(history: RouteComponentProps["history"]) {
        history.push(getPreviousPage("path"));
      },
    },
    {
      label: "Weiter",
      // size: 'large',
      classNames: "ml-auto",
      endIcon: faAngleRight,
      clickHandler(history: RouteComponentProps["history"]) {
        history.push(getNextPage("path"));
      },
    },
  ];

  useEffect(() => {
    // start scraping
    if (isUserLoggedIn && !isScrapingStarted) {
      dispatch({ type: "set-scraping-started", started: true });
    }
  }, []);

  return (
    <>
      <div>
        {demoMode && (
          <div className="absolute top-0 left-40">
            <PerfectArrow
              p1={{ x: 160, y: 155 }}
              p2={{ x: 60, y: 80 }}
              width={200}
              height={180}
            />
            <div className="absolute top-36 left-44 w-80">
              Du befindest dich im Demo-Modus.
            </div>
          </div>
        )}
        <div className="z-10 absolute top-1/3 left-48 py-6 px-8 text-yellow-1500 border-2 border-dashed border-yellow-700 bg-yellow-200/30 flex">
          <div className="mr-5 mt-2">
            <FontAwesomeIcon icon={faMousePointer} size="3x" />
          </div>
          <div>
            <p className="hl-2xl mb-1.5">Die Benutzeroberfläche</p>
            <p className="max-w-md text-lg">
              Bevor es losgeht, zeigen wir dir die wichtigsten Elemente der
              Benutzeroberfläche.
            </p>
          </div>
        </div>
        {!demoMode && (
          <div className="absolute top-0 right-40">
            <PerfectArrow
              p1={{ x: 30, y: 170 }}
              p2={{ x: 150, y: 80 }}
              width={200}
              height={180}
            />
            <div className="absolute top-36 -left-72 w-80">
              Wenn DataSkop Daten erfasst, erscheint dieser Ladebalken. Per
              Klick auf den Ladebalken kannst du dabei zuschauen.
            </div>
          </div>
        )}
        <div className="absolute top-0 right-0">
          <PerfectArrow
            p1={{ x: 290, y: 450 }}
            p2={{ x: 415, y: 80 }}
            width={450}
            height={500}
            options={{ flip: true, bow: 0.1 }}
          />
          <div className="absolute bottom-0 left-6 w-72">
            Im Menü kannst du mehr zu den Hintergründen von DataSkop erfahren.
          </div>
        </div>
        <div className="absolute bottom-8 left-56">
          <PerfectArrow
            p1={{ x: 25, y: 5 }}
            p2={{ x: 25, y: 150 }}
            width={50}
            height={170}
          />
          <div className="absolute -top-14 -left-28 w-72 text-center">
            Diese Leiste zeigt an, wo du Dich im Ablauf von DataSkop befindest.
          </div>
        </div>

        {/* <div className="p-6 max-w-lg mx-auto mb-10 text-center">
          <div>
            <div className="text-xl font-medium">Interface Tutorial</div>
            <p>Hier kommt das Interface-Tutorial</p>
          </div>
        </div> */}
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}

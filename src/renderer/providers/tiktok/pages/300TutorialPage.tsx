/**
 * TODO: For TikTok
 *
 * @module
 */
import { faLoader } from "@fortawesome/pro-duotone-svg-icons";
import {
  faChartScatterBubble,
  faCircleUser,
  faTriangleExclamation,
} from "@fortawesome/pro-light-svg-icons";
import {
  faAngleLeft,
  faAngleRight,
  IconDefinition,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { ReactNode, useRef } from "react";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import { Carousel, Slide } from "renderer/components/Carousel/Carousel";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { useNavigation } from "../../../contexts";

const themes = {
  tiktok: {
    parent: "bg-gradient-to-r from-[#00C6C0] via-black to-[#FF004F]",
    child: "bg-white text-black",
    icon: "text-black w-[5rem] h-[5rem] w-full",
  },
  alert: {
    parent: "bg-[#FFC27B] text-[#9E5500]",
    child: "bg-[#FFF4E7]",
    icon: "text-[#FFC27B] w-[5rem] h-[5rem] w-full",
  },
};

const TutorialSlide = ({
  title,
  icon,
  theme = "tiktok",
  children,
}: {
  title: string;
  icon: IconDefinition;
  theme?: keyof typeof themes;
  children: ReactNode;
}) => {
  return (
    <div
      className={clsx(
        "w-[55rem] mx-auto rounded-[2.250rem] p-2 mb-3 shadow-flat",
        themes[theme].parent,
      )}
    >
      <div
        className={clsx(
          "flex flex-col items-center justify-center rounded-[1.75rem] h-full w-full",
          themes[theme].child,
        )}
      >
        <FontAwesomeIcon
          icon={icon}
          className={clsx("mt-24", themes[theme].icon)}
        />
        <h2 className="hl-4xl mt-10 mb-9 text-black">{title}</h2>
        <div className="text-2xl min-h-[190px] px-8">{children}</div>
      </div>
    </div>
  );
};

export default function TutorialPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();
  const carouselRef = useRef<Glide.Properties>(null);

  const footerSlots: FooterSlots = {
    start: [
      <Button
        key="1"
        startIcon={faAngleLeft}
        theme="text"
        onClick={() => {
          history.push(getPreviousPage("path"));
        }}
      >
        Zurück
      </Button>,
    ],
    center: [
      <Button
        key="2"
        theme="text"
        onClick={() => {
          history.push(getNextPage("path"));
        }}
      >
        Überspringen
      </Button>,
      <Button
        key="3"
        endIcon={faAngleRight}
        onClick={() => {
          carouselRef.current?.go(">");
        }}
      >
        Weiter
      </Button>,
    ],
  };

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <h1 className="text-3xl font-medium mb-5">So funktioniert&apos;s</h1>
      <Carousel
        ref={carouselRef}
        showBullets
        options={{
          perView: 1,
          rewind: false,
        }}
      >
        <Slide key="1">
          <TutorialSlide title="Anmelden" icon={faCircleUser}>
            <p>
              Zuerst meldest du dich mit deinem TikTok-Konto an. Wir speichern
              deine Login-Daten nicht.
            </p>
          </TutorialSlide>
        </Slide>
        <Slide key="2">
          <TutorialSlide title="Download" icon={faLoader}>
            Als nächstes beantragt die DataSkop-App deine DSGVO-Daten. Sobald
            TikTok diese Daten bereitstellt, lädt die App sie im Hintergrund
            automatisch herunter und verarbeitet sie.
          </TutorialSlide>
        </Slide>
        <Slide key="3">
          <TutorialSlide
            title="Wichtig"
            icon={faTriangleExclamation}
            theme="alert"
          >
            Es kann bis zu vier Tage dauern, bis TikTok die DSGVO-Daten
            bereitstellt. Es ist deshalb wichtig, dass du die DataSkop-App im
            Hintergrund geöffnet hältst und nicht schließt. Du erhältst eine
            Benachrichtigung, sobald es weitergehen kann.
          </TutorialSlide>
        </Slide>
        <Slide key="4">
          <TutorialSlide title="Visualisierungen" icon={faChartScatterBubble}>
            Wenn die DataSkop-App die Daten heruntergeladen und verarbeitet hat,
            werden dir verschiedene interaktive Grafiken präsentiert, die dein
            Nutzungsverhalten auf TikTok visualisieren und einordnen.
          </TutorialSlide>
        </Slide>
      </Carousel>
    </WizardLayout>
  );
}

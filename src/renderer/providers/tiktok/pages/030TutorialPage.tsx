/**
 * TODO: For TikTok
 *
 * @module
 */
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
import { useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import { Carousel, Slide } from "renderer/components/Carousel/Carousel";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { useNavigation } from "../../../contexts";

const themes = {
  tiktok: {
    parent: "bg-gradient-to-r from-[#00C6C0] via-black to-[#FF004F]",
    child: "bg-white text-black",
    icon: "text-black w-[5rem] h-[5rem]",
  },
  alert: {
    parent: "bg-[#FFC077] text-[#904E00]",
    child: "bg-[#FFF4E7]",
    icon: "text-[#FFC077] w-[5rem] h-[5rem]",
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
        "w-[40rem] lg:w-[50rem] xl:w-[55rem] 2xl:w-[70rem] mx-auto rounded-5xl p-2 mb-3 shadow-flat",
        themes[theme].parent,
      )}
    >
      <div
        className={clsx(
          "flex flex-col items-center justify-center rounded-4xl h-full w-full",
          themes[theme].child,
        )}
      >
        <FontAwesomeIcon
          icon={icon}
          className={clsx("mt-24", themes[theme].icon)}
        />
        <h2 className="hl-3xl mt-8 mb-8">{title}</h2>
        <div className="text-xl max-w-prose min-h-[70px] lg:min-h-[90px] 2xl:min-h-[120px] px-10">
          {children}
        </div>
      </div>
    </div>
  );
};

const TutorialPage = (): JSX.Element => {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();
  const carouselRef = useRef<Glide.Properties>(null);
  const handlePrevClick = () => {
    if (carouselRef.current?.index === 0) {
      history.push(getPreviousPage("path"));
    } else {
      carouselRef.current?.go("<");
    }
  };

  const handleNextClick = () => {
    // FIXME: The slides should be saved in const to avoid this magic constant.
    if (carouselRef.current?.index === 2) {
      history.push(getNextPage("path"));
    } else {
      carouselRef.current?.go(">");
    }
  };

  const footerSlots: FooterSlots = {
    center: [
      <Button
        key="1"
        startIcon={faAngleLeft}
        theme="text"
        onClick={handlePrevClick}
      >
        Zurück
      </Button>,

      <Button key="3" endIcon={faAngleRight} onClick={handleNextClick}>
        Weiter
      </Button>,
    ],
    end: [
      <Button
        key="2"
        theme="text"
        onClick={() => {
          history.push(getNextPage("path"));
        }}
      >
        Überspringen
      </Button>,
    ],
  };

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <h1 className="text-3xl font-semibold mb-5">So funktioniert&apos;s</h1>
      <Carousel
        ref={carouselRef}
        showBullets
        options={{
          perView: 1,
          rewind: false,
        }}
      >
        <Slide>
          <TutorialSlide title="Anmelden" icon={faCircleUser}>
            Zuerst meldest du dich mit deinem TikTok-Konto an. Als Nächstes
            beantragt die DataSkop-App deine DSGVO-Daten. Alternativ kannst du
            auch deine DSGVO-Daten direkt in die App importieren.
          </TutorialSlide>
        </Slide>
        <Slide>
          <TutorialSlide
            title="Wichtig"
            icon={faTriangleExclamation}
            theme="alert"
          >
            Es dauert mehrere Tage, bis TikTok die DSGVO-Daten bereitstellt. Es
            ist deshalb wichtig, dass du die DataSkop-App nicht schließt und sie
            im Hintergrund geöffnet bleibt. Du erhältst eine Benachrichtigung,
            sobald es weitergehen kann.
          </TutorialSlide>
        </Slide>
        <Slide>
          <TutorialSlide title="Visualisierungen" icon={faChartScatterBubble}>
            Wenn die DataSkop-App die Daten heruntergeladen und verarbeitet hat,
            werden dir verschiedene interaktive Grafiken präsentiert, die dein
            Nutzungsverhalten auf TikTok visualisieren und einordnen.
          </TutorialSlide>
        </Slide>
      </Carousel>
    </WizardLayout>
  );
};

export default TutorialPage;

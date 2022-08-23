/**
 * TODO: For TikTok
 *
 * @module
 */
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import clsx from "clsx";
import { ReactNode, useRef } from "react";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import { Carousel, Slide } from "renderer/components/Carousel/Carousel";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { useNavigation } from "../../../contexts";

const themes = {
  tiktok: "bg-gradient-to-r from-[#00C6C0] via-black to-[#FF004F]",
};

const TutorialSlide = ({
  theme = "tiktok",
  children,
}: {
  theme?: keyof typeof themes;
  children: ReactNode;
}) => {
  return (
    <div
      className={clsx(
        "w-[55rem] mx-auto rounded-[2.250rem] p-2",
        themes[theme],
      )}
    >
      <div className="flex flex-col items-center justify-center px-6 py-16 rounded-[1.75rem] bg-white h-full w-full">
        {children}
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
      <h1 className="hl-3xl mb-5">Tutorial</h1>
      <Carousel
        ref={carouselRef}
        showBullets
        options={{
          perView: 1,
          rewind: false,
        }}
      >
        <Slide key="1">
          <TutorialSlide>
            <h2 className="hl-4xl">Das ist eine Überschrift</h2>
            <p>
              Hier kommt Text hin. Hier kommt Text hin. Hier kommt Text hin.
              Hier kommt Text hin. Hier kommt Text hin.{" "}
            </p>
          </TutorialSlide>
        </Slide>
        <Slide key="2">
          <TutorialSlide>Slide 2</TutorialSlide>
        </Slide>
        <Slide key="3">
          <TutorialSlide>Slide 3</TutorialSlide>
        </Slide>
      </Carousel>
    </WizardLayout>
  );
}

import { RecommendedVideo } from "@algorithmwatch/harke";
import { faSearch } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { useState } from "react";
import Button from "renderer/providers/youtube/components/Button";
import { Placement } from "tippy.js";
import { ScrapingResultSaved } from "../../../../lib/db/types";
import { exportSearchCsv } from "../../lib/export";
import { Carousel, Slide } from "../Carousel";
import { Options } from "../Carousel/types";
import Explainer from "../Explainer";
import Infobox from "../Infobox";
import VideoThumbnail, { TooltipContent } from "../VideoThumbnail";

interface SearchResultsCompareDataItem {
  query: string;
  signedInVideos: RecommendedVideo[];
  signedOutVideos: RecommendedVideo[];
}

function VideoList({
  items,
  tippyPlacement,
}: {
  items: RecommendedVideo[];
  tippyPlacement: Placement;
}) {
  return (
    <div className="space-y-2">
      {items.map(({ channelName, id, title }) => (
        <VideoThumbnail
          key={id}
          videoId={id}
          tippyOptions={{
            content: (
              <TooltipContent
                video={{ title, channel: { name: channelName } }}
              />
            ),
            placement: tippyPlacement,
            theme: "process-info",
          }}
        />
      ))}
    </div>
  );
}

function Visual({ session }: { session: SearchResultsCompareDataItem }) {
  const displayCount = 10;

  return (
    <div className="flex bg-yellow-200 border-2 border-yellow-400 w-full max-w-2xl mx-auto px-5 py-4 cursor-auto">
      <div className="mr-8 w-80 space-y-3">
        <div className="font-bold text-sm text-yellow-1500 mb-3">
          Suchbegriff
        </div>
        <div className="w-80 h-44 bg-yellow-300 overflow-hidden flex place-items-center place-content-center relative">
          <div className="z-20 text-2xl px-6 text-center">
            „{session.query}“
          </div>
          <div className="flex place-items-center place-content-center absolute inset-0 z-10">
            <FontAwesomeIcon
              icon={faSearch}
              size="6x"
              className="text-yellow-400"
            />
          </div>
        </div>
      </div>
      <div className="flex">
        <div className="mr-8">
          <div className="font-bold text-sm text-yellow-1500 mb-3">
            Angemeldet
          </div>
          {session.signedInVideos && (
            <VideoList
              items={session.signedInVideos.slice(0, displayCount)}
              tippyPlacement="left"
            />
          )}
        </div>
        <div className="">
          <div className="font-bold text-sm text-yellow-1500 mb-3">
            Nicht angemeldet
          </div>
          {session.signedOutVideos && (
            <VideoList
              items={session.signedOutVideos.slice(0, displayCount)}
              tippyPlacement="right"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchResultsCompare({
  data,
}: {
  data: ScrapingResultSaved[];
}) {
  const queryGroups = _(data)
    .filter({ slug: "yt-search-results-videos" })
    .groupBy("fields.query")
    .map((items, query) => ({
      query,
      signedInVideos: items[0]?.fields.videos,
      signedOutVideos: items[1]?.fields.videos,
    }))
    .value();

  const [explainerIsOpen, setExplainerIsOpen] = useState(true);
  const [waitExport, setWaitExport] = useState(false);

  const carouselOptions: Options = {
    // focusAt: 'center',
    // gap: 40,
    // peek: 350,
    breakpoints: {
      2000: {
        peek: 500,
        gap: 0,
      },
      1800: {
        peek: 400,
        gap: 0,
      },
      1600: {
        peek: 350,
        gap: 40,
      },
      1500: {
        peek: 300,
        gap: 40,
      },
      1400: {
        peek: 300,
        gap: 60,
      },
      1300: {
        peek: 250,
        gap: 60,
      },
      1200: {
        peek: 200,
        gap: 60,
      },
      1100: {
        peek: 0,
        focusAt: 0,
      },
    },
  };

  return (
    <>
      <Explainer
        isOpen={explainerIsOpen}
        onIsOpenChange={(val: boolean) => setExplainerIsOpen(val)}
      >
        <FontAwesomeIcon icon={faSearch} size="6x" className="text-blue-200" />
        <div className="max-w-prose">
          <h1 className="hl-4xl my-6">Search Viz</h1>
          <div className="space-y-4">
            <p>
              Visuell sieht dieses Experiment sehr ähnlich aus wie das
              Nachrichten-Experiment. Doch wir schauen diesmal auf die Suche.
              Statt einem Video kannst du eine Reihe von Suchbegriffen erkunden.
              Sie drehen sich alle um das Thema Bundestagswahl und sind zum Teil
              an aktuellen Ereignissen orientiert.
            </p>
            <p>
              Statt Empfehlungen zeigen wir dir hier die Liste der ersten zehn
              Suchergebnisse an, die auf die Eingabe der Suchbegriffe folgen.
              Dabei unterscheiden wir wieder die beiden Spalten: Links die
              Ergebnisse, wenn du eingeloggt bist, und rechts die Ergebnisse,
              wenn du nicht eingeloggt bist.
            </p>
            <div>
              <Infobox classname="mt-6">
                <p>
                  Bei diesem Experiment interessiert uns die Personalisierung
                  der Suchergebnisse: Wie beeinflussen die Verlaufsdaten deines
                  Profils und deine abonnierten Kanäle, was du als Ergebnisse
                  angezeigt bekommst?
                </p>
              </Infobox>
            </div>
          </div>
        </div>
      </Explainer>
      <Carousel options={carouselOptions}>
        {queryGroups.length > 0 &&
          queryGroups.map((session) => (
            <Slide key={session.query}>
              <Visual session={session} />
            </Slide>
          ))}
      </Carousel>
      <div className="mt-7 mx-auto">
        <Button
          disabled={waitExport}
          theme={"link"}
          size={"small"}
          onClick={async () => {
            setWaitExport(true);
            await exportSearchCsv(queryGroups);
            setWaitExport(false);
          }}
        >
          {waitExport
            ? "Einen Moment bitte, der Export wird vorbereitet"
            : "CSV exportieren"}
        </Button>
      </div>
    </>
  );
}

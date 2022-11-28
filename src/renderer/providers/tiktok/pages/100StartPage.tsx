/**
 * TODO: For TikTok
 *
 * @module
 */
import { faAngleRight } from "@fortawesome/pro-regular-svg-icons";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import { useNavigation } from "../../../contexts";
import awlogo from "../../../static/images/logos/aw-logo.png";
import bmbflogo from "../../../static/images/logos/bmbf-logo.png";
import enslogo from "../../../static/images/logos/ens-logo.png";
import fhplogo from "../../../static/images/logos/fhp-logo.png";
import mplogo from "../../../static/images/logos/mp-logo.png";
import uplogo from "../../../static/images/logos/up-logo.png";
import { shouldJumpToWaitingPage } from "../lib/status";
import dslogo from "../static/images/logo.svg";

export default function StartPage(): JSX.Element {
  const { getNextPage } = useNavigation();
  const history = useHistory();

  // Jump to waiting screen (sometimes)
  useEffect(() => {
    (async () => {
      const doJump = await shouldJumpToWaitingPage();
      if (doJump) {
        window.electron.log.info(`Jump to waiting page`);
        history.push("/tiktok/waiting");
      } else {
        window.electron.log.info(`Don't jump to waiting page`);
      }
    })();
  }, []);

  const hadnleNextClick = () => {
    history.push(getNextPage("path"));
  };

  return (
    <>
      <div className="grow mx-auto flex flex-col h-full min-h-0">
        <div className="grow flex flex-col justify-center items-center max-h-[65%] h-full">
          <img src={dslogo} alt="Dataskop Logo" className="w-80 mx-auto" />
          <div className="mt-6">
            <Button endIcon={faAngleRight} onClick={hadnleNextClick}>
              Start
            </Button>
          </div>
        </div>
        <div className="flex pb-8">
          <div className="text-center">
            <div className="font-bold mb-3">Partner:</div>
            <div className="flex flex-wrap items-center justify-center mb-5 max-w-xl">
              <img
                src={awlogo}
                alt=""
                className="mx-3 py-1 block w-36 h-auto"
              />
              <img
                src={enslogo}
                alt=""
                className="mx-3 py-1 block w-20 h-auto"
              />
              <img
                src={uplogo}
                alt=""
                className="mx-3 py-1 block w-36 h-auto"
              />
              <img
                src={fhplogo}
                alt=""
                className="mx-3 py-1 block w-48 h-auto"
              />
              <img
                src={mplogo}
                alt=""
                className="mx-3 py-1 block w-36 h-auto"
              />
            </div>
          </div>
          <div className="text-center">
            <div className="font-bold">Gefördert durch:</div>
            <img src={bmbflogo} alt="" className="block w-52 mx-auto -mt-1" />
          </div>
        </div>
      </div>
    </>
  );
}

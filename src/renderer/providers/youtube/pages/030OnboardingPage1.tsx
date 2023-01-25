import { faAngleLeft } from "@fortawesome/pro-solid-svg-icons";
import { useEffect } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { useConfig, useNavigation, useScraping } from "renderer/contexts";
import Button from "renderer/providers/youtube/components/Button";
import ContentWrapper from "renderer/providers/youtube/components/ContentWrapper";
import FooterNav, {
  FooterNavItem,
} from "renderer/providers/youtube/components/FooterNav";

const OnboardingPage1 = (): JSX.Element => {
  const { getNextPage, getPreviousPage } = useNavigation();
  const {
    state: { isUserLoggedIn, campaign },
    dispatch,
  } = useScraping();
  const hist = useHistory();
  const { sendEvent } = useConfig();

  const footerNavItems: FooterNavItem[] = [
    {
      label: "Zurück",
      startIcon: faAngleLeft,
      theme: "link",
      clickHandler(history: RouteComponentProps["history"]) {
        dispatch({ type: "set-visible-window", visibleWindow: false });
        history.push(getPreviousPage("path"));
      },
    },
  ];

  useEffect(() => {
    if (isUserLoggedIn) {
      // hide login window
      dispatch({ type: "set-visible-window", visibleWindow: false });
      // go to next page
      hist.push(getNextPage("path"));
    }
  }, [isUserLoggedIn]);

  useEffect(
    () => dispatch({ type: "set-demo-mode", demoMode: false, demoData: null }),
    [],
  );

  return (
    <>
      <ContentWrapper centerY>
        <div className="space-y-10 text-center">
          <div>
            <div className="hl-4xl mb-6 text-center">Login bei YouTube</div>
            <p>
              Als Erstes möchten wir dich bitten, dich bei YouTube (YT)
              anzumelden. Das geht mit deinem Google-/GMail-Konto. Wir speichern
              die Login-Informationen nicht. Ggf. musst du den Login in deinem
              Google-Mail-Konto bestätigen. du musst mind. 18 Jahre alt sein, um
              Daten an uns spenden zu können.
            </p>
            <div className="mt-4">
              <Button
                onClick={() => {
                  dispatch({
                    type: "set-attached",
                    attached: true,
                    visible: true,
                  });
                  sendEvent(campaign, "clicked start scraping");
                }}
              >
                Anmelden
              </Button>
            </div>
          </div>
          <div>
            <div className="hl-xl mb-4">Kein YouTube-Konto?</div>
            <p>
              Wenn du dich nicht einloggen möchtest oder kein YT-Konto hast,
              kannst du mit einem „Demo-Datensatz“ fortfahren. Wir fragen dich
              am Ende noch einmal, ob du nicht doch Daten spenden könntest, um
              unsere Untersuchung zu unterstützen.
            </p>
            <div className="mt-4">
              <Button
                onClick={() => {
                  if (campaign === null) return;
                  dispatch({
                    type: "set-demo-mode",
                    demoMode: true,
                    demoData: campaign.config.demoData[0],
                  });
                  sendEvent(campaign, "clicked use demo data");
                  hist.push("/youtube/onboarding2");
                }}
              >
                Demo starten
              </Button>
            </div>
          </div>
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
};

export default OnboardingPage1;

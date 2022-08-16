/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { RouteComponentProps } from "react-router-dom";
import FooterNav, {
  FooterNavItem,
} from "renderer/providers/youtube/components/FooterNav";
import { useModal } from "../../../contexts";
import { useNavigation } from "../../../contexts/navigation";

export default function DonationPage1(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const { dispatch: dispatchModal } = useModal();

  const footerNavItems: FooterNavItem[] = [
    {
      label: "Zurück",
      theme: "link",
      startIcon: faAngleLeft,
      clickHandler(history: RouteComponentProps["history"]) {
        history.push(getPreviousPage("path"));
      },
    },
    {
      label: "Zustimmen & Weiter",
      endIcon: faAngleRight,
      clickHandler(history: RouteComponentProps["history"]) {
        history.push(getNextPage("path"));
      },
    },
  ];

  return (
    <>
      <div className="p-6 max-w-prose mx-auto">
        <div className="hl-4xl mb-6">Die Datenspende</div>
        <div className="space-y-6">
          <p>
            Jede Datenspende hilft! Je mehr von euch Daten in unser Projekt
            spenden, desto besser lassen sich unsere Analysen erhärten und
            ausweiten. Es gibt daher auch keine Daten oder Profile, die für
            unsere Forschung irrelevant oder verzichtbar wären. Für jedes
            geschenkte Vertrauen in Form einer Datenspende sind wir sehr
            dankbar! Mit unserer Forschung wollen wir nicht zuletzt dazu
            beitragen, dass auch ihr euch bewusst und informiert auf der
            YouTube-Plattform bewegen könnt.
          </p>
          <p>
            Um deine Daten zu spenden, musst du bei DataSkop einen Account
            anlegen. Damit kannst du später deine Daten herunterladen oder sie
            auch löschen. Das müssen wir dir wegen der
            Datenschutz-Grundverordnung ermöglichen. Wir halten es aber auch für
            richtig, dass du diesen Zugriff auf deine Daten bekommst. Über
            deinen Account können wir dich gegebenenfalls später auch fragen, ob
            du bereit wärst, deine Daten weiteren Forscherinnen und Forschern
            oder Redaktionen zur Verfügung zu stellen. Zudem möchten wir dich
            möglicherweise wegen Nachfragen kontaktierten und dich zur Teilnahme
            an anderen Datenspendenprojekten einladen.
          </p>
          <div className="space-y-6 border-2 border-yellow-500 p-6">
            <p className="font-bold text-lg">
              Bevor du spendest, musst du zwei Dingen zustimmen:
            </p>

            <p>
              Dem „Datenspendevertrag“ (
              <a
                className="link-blue"
                onClick={() =>
                  dispatchModal({
                    type: "set-modal-options",
                    options: { isOpen: true, componentName: "terms" },
                  })
                }
              >
                lesen
              </a>
              ) und der „Datenschutzerklärung“ (
              <a
                className="link-blue"
                onClick={() =>
                  dispatchModal({
                    type: "set-modal-options",
                    options: { isOpen: true, componentName: "privacy" },
                  })
                }
              >
                lesen
              </a>
              ). Diese enthalten diese wesentlichen Regelungen:
            </p>
            <ul className="list-disc pl-4">
              <li>
                Du musst mindestens 18 Jahre sein, um teilnehmen zu können.
              </li>
              <li>
                Du musst ein DataSkop-Konto anlegen. Dafür benötigt du eine
                E-Mail-Adresse. Mit dem Konto kannst du auf deine gespendete
                Daten zugreifen, die herunterladen und löschen.
              </li>
              <li>
                Die von dir gespendeten Daten werden unter strengen
                Datenschutzvorschriften Forscher*innen der Europa-Universät
                Viadrina sowie Datenjournalist*innen von Der Spiegel zur
                Auswertung weiter übergeben.
              </li>
              <li>
                Die datenschutzrechtliche Verantwortliche ist die AlgorithmWatch
                gGmbH. Für dieses YouTube-Pilotprojekt hat sie eine Vereinbarung
                über die gemeinsame Verarbeitung von personenbezogenen Daten mit
                der Europa-Universät Viadrina geschlossen.
              </li>
              <li>
                Wir geben die Daten ggf. an andere Forscher*innen und
                Journalist*innen unter strengen Datenschutzvorgaben weiter. In
                dem Fall informieren wir dich vorab und du hast 15 Tage Zeit,
                der Weitergabe zu widersprechen.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}

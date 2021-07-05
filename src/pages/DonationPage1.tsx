import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useNavigation } from '../contexts/navigation';

export default function DonationPage1(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();

  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Zurück',
      theme: 'link',
      startIcon: faAngleLeft,
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getPreviousPage('path'));
      },
    },
    {
      label: 'Zustimmen & Weiter',
      endIcon: faAngleRight,
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
      },
    },
  ];

  return (
    <>
      <div className="p-6 max-w-prose mx-auto">
        <div className="text-2xl font-bold mb-6">Die Datenspende</div>
        <div className="space-y-6">
          <p>
            Jede Datenspende hilft! Je mehr User ihre Daten in unserem Projekt
            spenden, desto besser lassen sich unsere Analysen erhärten oder
            verbreitern. Es gibt daher auch keine Daten von Profilen, die für
            unsere Forschung irrelevant oder verzichtbar wären. Wir sind sehr
            dankbar für jedes geschenkte Vertrauen in Form einer Datenspende .
            Mit unserer Forschung wollen wir schließlich auch den Usern dabei
            unterstützen, sich bewusst und informiert auf der YouTube zu
            bewegen.
          </p>
          <p>
            Um die Daten zu spenden, musst Du bei DataSkop einen Account
            anlegen. Damit Du später Deine Daten herunterladen oder sie löschen
            kannst – das müssen wir Dir wegen der Datenschutzgrundverordnung
            ermöglichen. Und wir halten es auch für richtig, dass Du diesen
            Zugriff hast. Wir wollen Dich aber auch fragen können, ob Du etwas
            dagegen hast, wenn wir die Daten später möglicherweise noch mit
            weiteren Forschern oder Redaktionen teilen. Zudem möchten wir Dich
            vielleicht wegen Nachfragen kontaktierten und Dich zur Teilnahme an
            anderen Datenspendenprojekten auffordern können.
          </p>
          <div className="space-y-6 bg-white border-2 border-yellow-200 p-6">
            <p className="font-bold text-lg">
              Bevor Du spendest, musst Du zwei Dingen zustimmen:
            </p>

            <p>
              A. Dem Datenspendevertrag. In dem steht im wesentlichen folgendes:
            </p>
            <ul className="list-disc list-inside">
              <li>Platzhalter 1</li>
              <li>Platzhalter 2</li>
              <li>Platzhalter 3</li>
              <li>Platzhalter 4</li>
            </ul>

            <p>
              B. Der Datenschutzerklärung. Die beinhaltet diese entscheidenen
              Punkte:
            </p>
            <ul className="list-disc list-inside">
              <li>Platzhalter 1</li>
              <li>Platzhalter 2</li>
              <li>Platzhalter 3</li>
              <li>Platzhalter 4</li>
            </ul>
          </div>
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}

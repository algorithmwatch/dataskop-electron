/**
 * A page with a basic questionnaire. The form was initially built with formik
 * but ported to react-form-hook. If this component gets ever used again, ensure
 * that it works. The limit for the checkboxes needs to get implemented.
 *
 * @module
 */

// @ts-nocheck
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { constants } from '@algorithmwatch/harke';
import { faAngleLeft, faAngleRight } from '@fortawesome/pro-solid-svg-icons';
import React from 'react';
import { useForm } from 'react-hook-form';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Button from 'renderer/components/Button';
import FooterNav, { FooterNavItem } from 'renderer/components/FooterNav';
import { useNavigation, useScraping } from 'renderer/contexts';
import { addQuestionnaireToSession } from 'renderer/lib/db';

export default function QuestionnairePage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const hist = useHistory();

  const {
    state: { sessionId },
  } = useScraping();

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
      label: 'Weiter',
      endIcon: faAngleRight,
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
      },
    },
  ];

  const usage = {
    vpn: 'Ich nutze YouTube über ein VPN.',
    shared: 'Ich teile meinen YouTube Account mit mind. einer weiteren Person.',
    multiple: 'Ich nutze YouTube über verschiedene Accounts.',
    anon: 'Ich nutze YouTube überwiegend ohne eingeloggt zu sein.',
    local: 'Ich nutze YouTube überwiegend im oben angegebenen PLZ',
  };

  const onSubmit = (values) => {
    if (sessionId === null) {
      console.log('onSubmit', values);
      console.error('session is not set');
    } else {
      addQuestionnaireToSession(sessionId, values);
    }

    hist.push(getNextPage('path'));
  };

  return (
    <>
      <div className="mx-auto max-w-4xl flex flex-col justify-center w-full">
        <div className="hl-4xl mb-6">Fragebogen</div>
        <div className="max-w-2xl mb-6">
          <p>
            Um deine Datenspende besser auswerten zu können, bitten wir Dich,
            folgende Fragen zu beantworten. Du kannst auch nur einige oder keine
            Fragen beantworten.
          </p>
        </div>
        <div className="">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="divide-y divide-yellow-600 divide-dashed">
              <div className="p-3">
                <div>
                  <input type="checkbox" id="contactCheck" name="contact" />
                  <label className="font-medium pl-3" for="contactCheck">
                    Ja, mich dürfen die beteiligten Forscher*innen oder
                    Journalist*innen mit Nachfragen kontaktieren.
                  </label>
                </div>
              </div>
              <div className="p-3">
                <label htmlFor="sex" className="w-28 inline-block font-medium">
                  Geschlecht
                </label>
                <div role="group" aria-labelledby="sex" className="ml-3 inline">
                  <label className="mr-3">
                    <input
                      type="radio"
                      name="sex"
                      value="Frau"
                      className="mr-2"
                    />
                    Frau
                  </label>
                  <label className="mr-3">
                    <input
                      type="radio"
                      name="sex"
                      value="Mann"
                      className="mr-2"
                    />
                    Mann
                  </label>
                  <label className="">
                    <input
                      type="radio"
                      name="sex"
                      value="Divers"
                      className="mr-2"
                    />
                    Divers
                  </label>
                </div>
              </div>
              <div className="p-3">
                <label htmlFor="age" className="w-28 inline-block font-medium">
                  Alter
                </label>
                <input
                  type="number"
                  name="age"
                  maxLength="2"
                  min="18"
                  max="99"
                  step="1"
                  className="ml-2 p-1 w-20 text-center border rounded "
                />
                <span className="text-xs ml-2">
                  (du musst mind. 18 Jahre alt sein)
                </span>
              </div>
              <div className="p-3">
                <label htmlFor="zip" className="w-28 inline-block font-medium">
                  Wohnort
                </label>
                <input
                  type="text"
                  min="0"
                  max="99"
                  step="1"
                  name="zip"
                  maxLength="2"
                  placeholder="PLZ"
                  className="ml-2 p-1 w-20 text-center border rounded  appearance-none hover:appearance-none focus:appearance-none"
                />
                <span className="text-xs ml-2">(ersten zwei Stellen)</span>
              </div>
              {/* FIXME: More than 3 categories can be selected */}
              <div className="p-3">
                <label htmlFor="categories" className="font-medium">
                  Nach Gefühl: Welche drei Kategorien schaust du am meisten auf
                  YouTube?
                </label>
                <div
                  role="group"
                  aria-labelledby="categories"
                  className="grid grid-cols-2 mt-2"
                >
                  {constants.categories
                    .map(({ de }) => de)
                    .map((c) => (
                      <label key={c}>
                        <input
                          type="checkbox"
                          name="categories"
                          value={c}
                          className="mr-2"
                        />
                        {c}
                      </label>
                    ))}
                </div>
              </div>
              <div className="p-3">
                <label htmlFor="using" className="font-medium">
                  Bitte zutreffendes ankreuzen
                </label>
                <div role="group" aria-labelledby="using" className="mt-2">
                  {Object.entries(usage).map(([value, label]) => (
                    <label key={value} className="block">
                      <input
                        type="checkbox"
                        name="using"
                        value={value}
                        className="mr-2"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Button size="small" theme="blue" type="submit">
                Speichern & weiter
              </Button>
            </div>
          </form>
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}

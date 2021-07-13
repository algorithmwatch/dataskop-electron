/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import { Field, Form, Formik, useField, useFormikContext } from 'formik';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Button from '../components/Button';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useNavigation } from '../contexts/navigation';

export default function QuestionnairePage(): JSX.Element {
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
      label: 'Weiter',
      endIcon: faAngleRight,
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
      },
    },
  ];

  const categories = [
    'Film & Animation',
    'Autos & Fahrzeuge',
    'Musik, Tiere, Sport',
    'Reisen & Events',
    'Gaming',
    'Menschen & Blogs',
    'Comedy',
    'Unterhaltung',
    'Nachrichten & Politik',
    'Praktische Tipps & Styling',
    'Bildung',
    'Wissenschaft & Technik',
    'Soziales',
    'Engagement',
  ];

  const usage = {
    vpn: 'Ich nutze YouTube über ein VPN.',
    shared: 'Ich teile meinen YouTube Account mit mind. einer weiteren Person.',
    multiple: 'Ich nutze YouTube über verschiedene Accounts.',
    anon: 'Ich nutze YouTube überwiegend ohne eingeloggt zu sein.',
    local: 'Ich nutze YouTube überwiegend im oben angegebenen PLZ',
  };

  const onSubmit = (values) => {
    console.log('onSubmit', values);
  };

  const LimitCheckbox = (props) => {
    const { values, touched, setFieldValue } = useFormikContext();
    const valuesField = values[props.name];
    const touchField = touched[props.name];
    const [field, meta] = useField(props);

    React.useEffect(() => {
      if (touchField && valuesField?.length > 3) {
        setFieldValue(props.name, valuesField.slice(0, 3));
      }
    }, [valuesField, setFieldValue, touchField, props.name]);

    return (
      <>
        <input {...props} {...field} />
        {!!meta.touched && !!meta.error && <div>{meta.error}</div>}
      </>
    );
  };

  return (
    <>
      <div className="mx-auto max-w-4xl flex flex-col justify-center w-full">
        <div className="hl-4xl mb-6">Fragebogen</div>
        <div className="max-w-2xl mb-6">
          <p>
            Um Deine Datenspende nützlich auswerten zu können, bitten wir Dich,
            folgende Fragen zu beantworten. Du kannst auch nur einige oder keine
            Fragen beantworten.
          </p>
        </div>
        <div className="">
          <Formik initialValues={{}} onSubmit={onSubmit}>
            <Form>
              <div className="divide-y divide-yellow-600 divide-dashed">
                <div className="p-3">
                  <label className="font-medium">
                    <Field
                      type="checkbox"
                      name="contact"
                      className="mr-2 semibold"
                    />
                    <span>
                      Dürfen Dich die beteiligten Forscher*innen oder
                      Journalist*innen mit Nachfragen kontaktieren?
                    </span>
                  </label>
                </div>
                <div className="p-3">
                  <label
                    htmlFor="sex"
                    className="w-28 inline-block font-medium"
                  >
                    Geschlecht
                  </label>
                  <div
                    role="group"
                    aria-labelledby="sex"
                    className="ml-3 inline"
                  >
                    <label className="mr-3">
                      <Field
                        type="radio"
                        name="sex"
                        value="Frau"
                        className="mr-2"
                      />
                      Frau
                    </label>
                    <label className="mr-3">
                      <Field
                        type="radio"
                        name="sex"
                        value="Mann"
                        className="mr-2"
                      />
                      Mann
                    </label>
                    <label className="">
                      <Field
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
                  <label
                    htmlFor="age"
                    className="w-28 inline-block font-medium"
                  >
                    Alter
                  </label>
                  <Field
                    type="text"
                    name="age"
                    // pattern="[1-9][1-9]"
                    maxLength="2"
                    min="1"
                    max="99"
                    step="1"
                    className="ml-2 p-1 w-20 text-center border rounded "
                  />
                </div>
                <div className="p-3">
                  <label
                    htmlFor="zip"
                    className="w-28 inline-block font-medium"
                  >
                    Wohnort
                  </label>
                  <Field
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
                <div className="p-3">
                  <label htmlFor="categories" className="font-medium">
                    Nach Gefühl: Welche drei Kategorien schaust Du am meisten
                    auf YouTube?
                  </label>
                  <div
                    role="group"
                    aria-labelledby="categories"
                    className="grid grid-cols-2 mt-2"
                  >
                    {categories.map((c) => (
                      <label key={c}>
                        <LimitCheckbox
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
                        <Field
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
                  Abschicken
                </Button>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}

import { Field, Form, Formik } from 'formik';
import React from 'react';
import ContentWrapper from '../components/ContentWrapper';

export default function Questionaire(): JSX.Element {
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
    local: 'Ich nutze YouTube überwiegend im oben angegebenen Landkreis',
  };
  return (
    <>
      <ContentWrapper>
        <div className="hl-4xl mb-6">Fragebogen</div>
        <div className="space-y-4 mb-6">
          <p>
            Um Deine Datenspende nützlich auswerten zu können, bitten wir Dich,
            folgende Fragen zu beantworten. Du kannst auch nur einige oder keine
            Fragen beantworten.
          </p>
        </div>
        <div className="space-y-4">
          <Formik
            initialValues={{}}
            onSubmit={async (values) => {
              //await new Promise((r) => setTimeout(r, 500));
              console.log(values);
            }}
          >
            <Form>
              <div className="mb-3">
                <label htmlFor="contact">
                  Dürfen Dich die beteiligten Forscher*innen oder
                  Journalist*innen mit Nachfragen kontaktieren
                </label>
                <Field type="checkbox" name="contact" className="ml-2" />
              </div>
              <div className="mb-3">
                <div id="sex">Geschlecht</div>
                <div role="group" aria-labelledby="sex">
                  <label>
                    <Field
                      type="radio"
                      name="sex"
                      value="Frau"
                      className="mr-2"
                    />
                    Frau
                  </label>
                  <label>
                    <Field
                      type="radio"
                      name="sex"
                      value="Mann"
                      className="mr-2"
                    />
                    Mann
                  </label>
                  <label>
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
              <div className="mb-3">
                <label htmlFor="age">Alter</label>
                <Field
                  type="number"
                  name="age"
                  min="1"
                  max="100"
                  step="1"
                  className="ml-2"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="zip">Wohnort (PLZ erste zwei Stellen)</label>
                <Field type="input" name="zip" maxlength="2" className="ml-2" />
              </div>
              <div className="mb-3">
                <label htmlFor="categories">
                  Nach Gefühl: Welche drei Kategorien schaust Du am meisten auf
                  YouTube?
                </label>
                <div role="group" aria-labelledby="categories">
                  {categories.map((c) => (
                    <div key={c}>
                      <Field
                        type="checkbox"
                        name="categories"
                        value={c}
                        className="mr-2"
                      />
                      {c}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="using">Bitte zutreffendes ankreuzen</label>
                <div role="group" aria-labelledby="using">
                  {Object.entries(usage).map(([value, label]) => (
                    <div key={value}>
                      <Field
                        type="checkbox"
                        name="using"
                        value={value}
                        className="mr-2"
                      />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit">Submit</button>
            </Form>
          </Formik>
        </div>
      </ContentWrapper>
    </>
  );
}

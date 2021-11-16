/* eslint-disable react/jsx-props-no-spreading */
import { faAngleLeft } from '@fortawesome/pro-regular-svg-icons';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Button from 'renderer/components/Button';
import FooterNav, { FooterNavItem } from 'renderer/components/FooterNav';
import { useConfig, useNavigation, useScraping } from 'renderer/contexts';
import {
  getLookups,
  getScrapingResultsBySession,
  getSessionById,
} from 'renderer/lib/db';
import { postDonation } from '../../../lib/utils/networking';
import { redactWatchHistory } from '../lib/utils';

export default function DonationPage2(): JSX.Element {
  const [status, setStatus] = useState('');
  const [results, setResults] = useState<any>(null);
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();
  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Zurück',
      theme: 'link',
      startIcon: faAngleLeft,
      clickHandler(hist: RouteComponentProps['history']) {
        hist.push(getPreviousPage('path'));
      },
    },
  ];

  const {
    state: { platformUrl, seriousProtection, version },
  } = useConfig();

  const {
    state: { sessionId },
  } = useScraping();

  useEffect(() => {
    const theFun = async () => {
      console.log(sessionId);
      if (sessionId === null) return;
      const newResult = await getScrapingResultsBySession(sessionId);
      setResults(newResult);
    };

    theFun();
  }, [sessionId]);

  const { register, handleSubmit } = useForm();

  const onSubmit = async ({ email }: { email: string }) => {
    if (platformUrl == null) {
      setStatus('ask the dev to set the platform url :/');
      return;
    }

    if (sessionId == null) {
      setStatus('something is wrong the the session id :/ ');
      return;
    }

    const scrapingSession = await getSessionById(sessionId);

    if (scrapingSession === null) {
      setStatus('session is null, something is broken :/');
      return;
    }

    const redactedResults = redactWatchHistory(results, await getLookups());

    const resp = await postDonation(
      version,
      platformUrl,
      seriousProtection,
      email,
      redactedResults,
      scrapingSession,
    );
    if (resp.ok) {
      history.push(getNextPage('path'));
    } else {
      setStatus(`fail: ${JSON.stringify(resp)}`);
    }
  };

  // email pattern: https://stackoverflow.com/a/36379040/4028896

  return (
    <>
      <div className="p-6 max-w-prose mx-auto text-center">
        <div className="hl-4xl mb-6">Du hast es fast geschafft!</div>
        <div className="space-y-4">
          <p>
            Gib deine E-Mail-Adresse ein. Damit wird für dich ein DataSkop-Konto
            eingerichtet. Im Anschluss erhältst du eine E-Mail mit einem Link,
            den du bestätigen musst. Bitte schaue in dein Postfach.
          </p>
          <p className="line-through">
            Die Datenspende ist nach diesem Schritt abgeschlossen.
          </p>
          <p>
            Der Zeitraum der Datenspende ist zu Ende. Es ist nicht mehr möglich
            Daten an uns zu spenden.
          </p>
          {status.length > 0 && <div className="text-red-700">{status}</div>}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col space-y-4 items-center"
          >
            <input
              required
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              title="Invalid email address"
              type="email"
              className="p-2.5 w-80 text-base bg-white border border-yellow-600 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all"
              {...register('email')}
            />
            <Button type="submit" size="large" disabled>
              Daten spenden
            </Button>
          </form>
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}

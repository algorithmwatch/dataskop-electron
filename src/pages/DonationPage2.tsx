/* eslint-disable react/jsx-props-no-spreading */
import { faAngleLeft } from '@fortawesome/pro-regular-svg-icons';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Button from '../components/Button';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useConfig, useNavigation, useScraping } from '../contexts';
import { getLookups, getScrapingResultsBySession, getSessionById } from '../db';
import { redactWatchHistory } from '../providers/youtube/utils';
import { postDonation } from '../utils/networking';

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
    state: { platformUrl },
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
      platformUrl,
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
        <div className="text-2xl font-bold mb-6">Die Datenspende</div>
        <div className="space-y-4">
          <p>
            Du hast es fast geschafft! Gebe Deine E-Mail-Adresse für Deinen
            DataSkop-Account ein. Im Anschluss erhältst Du eine E-Mail mit einem
            Link, den Du bestätigen musst. Die Datenspende ist nach diesem
            Schritt abgeschlossen.
          </p>
          {status.length > 0 && <div className="text-red-700">{status}</div>}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col space-y-4 items-center"
          >
            <input
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              title="Invalid email address"
              type="email"
              className="p-2.5 w-80 text-base bg-white border border-yellow-600 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all"
              {...register('email')}
            />
            <Button type="submit">Absenden</Button>
          </form>
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}

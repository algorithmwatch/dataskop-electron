/* eslint-disable react/jsx-props-no-spreading */
import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useConfig, useNavigation, useScraping } from '../contexts';
import { getScrapingResultsBySession, getSessionById } from '../db';
import { postDonation } from '../utils/networking';

export default function DonationPage2(): JSX.Element {
  const [status, setStatus] = useState('');
  const [results, setResults] = useState<any>(null);
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

    const resp = await postDonation(
      platformUrl,
      email,
      results,
      scrapingSession,
    );
    if (resp.ok) setStatus('Success!');
    else {
      setStatus(`fail: ${JSON.stringify(resp)}`);
    }
  };

  // email pattern: https://stackoverflow.com/a/36379040/4028896

  return (
    <>
      <div>
        <div className="text-xl font-medium">Donation 1</div>
        <div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio
          molestiae laboriosam adipisci odio molestias eligendi, illo fugit ad
          impedit repellendus nulla beatae unde quasi eaque ea consequatur
          recusandae velit necessitatibus!
        </div>
        <div>{status}</div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              title="Invalid email address"
              type="email"
              {...register('email')}
            />
            <input type="submit" />
          </form>
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}

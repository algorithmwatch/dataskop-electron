/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useConfig, useScraping } from '../contexts';
import { getScrapingResultsBySession, getSessionById } from '../db';
import { postDonation } from '../utils/networking';

export default function DonationPage1(): JSX.Element {
  const [status, setStatus] = useState('');
  const [results, setResults] = useState<any>(null);

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
    </>
  );
}

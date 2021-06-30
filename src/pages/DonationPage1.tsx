/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useConfig, useScraping } from '../contexts';
import {
  getScrapingResultsBySession,
  getSessionById,
  getSessions
} from '../db';
import { postDonation } from '../utils/networking';

export default function DonationPage1(): JSX.Element {
  const [status, setStatus] = useState('');

  const {
    state: { isDebug, platformUrl },
  } = useConfig();

  const {
    state: { sessionId },
  } = useScraping();

  const { register, handleSubmit } = useForm();

  const onSubmit = async ({ email }: { email: string }) => {
    if (platformUrl == null) {
      setStatus('ask the dev to set the platform url :/');
      return;
    }
    let theSId = sessionId;

    if (isDebug) {
      // choose a random session id for debug
      // eslint-disable-next-line prefer-destructuring
      if (theSId == null) theSId = (await getSessions())[0].sessionId;
    } else if (theSId == null) {
      setStatus('something is wrong the the session id :/ ');
      return;
    }

    const result = await getScrapingResultsBySession(theSId);
    const scrapingSession = await getSessionById(theSId);

    if (scrapingSession === null) {
      setStatus('session is null, something is broken :/');
      return;
    }

    // await postDonation(platformUrl, email, campaign.id, result, scrapingConfig);
    const resp = await postDonation(
      platformUrl,
      email,
      result,
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

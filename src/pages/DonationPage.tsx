/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useConfig, useScraping } from '../contexts';
import { getSessionData, getSessions } from '../db';
import { Campaign } from '../providers/types';
import { postDonation } from '../utils/networking';

export default function DonationPage(): JSX.Element {
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
      setStatus('ask the dev to set the platform url');
      return;
    }

    let theCam = campaign;
    let theSId = sessionId;

    if (isDebug) {
      if (theCam == null) theCam = { id: 1 } as Campaign;

      // eslint-disable-next-line prefer-destructuring
      if (theSId == null) theSId = (await getSessions())[0].sessionId;
    } else {
      if (theCam == null) {
        setStatus('cannot donate when chosing a local scraping config');
        return;
      }

      if (theSId == null) {
        setStatus('something is wrong the the session id');
        return;
      }
    }

    const result = getSessionData(theSId);

    const sessionInfo = (await getSessions()).filter(
      ({ sessionId }) => sessionId === theSId,
    )[0];

    // await postDonation(platformUrl, email, campaign.id, result, scrapingConfig);
    const resp = await postDonation(
      platformUrl,
      email,
      theCam.id,
      result,
      sessionInfo,
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

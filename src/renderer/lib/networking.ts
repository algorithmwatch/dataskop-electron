/**
 * A collection of functions to communiate with the backend / platform.
 *
 * @module
 */
import { Buffer } from "buffer";
import { Campaign } from "renderer/providers/types";

const toBase64 = (str: string) => {
  return Buffer.from(str, "utf-8").toString("base64");
};

// eslint-disable-next-line @typescript-eslint/ban-types
const postJson = (url: string, seriousProtection: string | null, body: any) => {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${toBase64(`user:${seriousProtection}`)}`,
    },
  });
};

const getActiveCampaigns = async (
  platformUrl: string,
  seriousProtection: string | null,
): Promise<Campaign[]> => {
  const url = `${platformUrl}/api/campaigns/`;

  const activeCampaigns = await (
    await fetch(url, {
      headers: {
        Authorization: `Basic ${toBase64(`user:${seriousProtection}`)}`,
      },
    })
  ).json();

  activeCampaigns.forEach((x) => {
    x.config = x.scraping_config;
    delete x.scraping_config;

    // hotfix for migration
    if (x.config === null) return;
    x.config.navigation ||= "yt-default";
  });

  return activeCampaigns;
};

const postEvent = async (
  platformUrl: string,
  seriousProtection: string | null,
  campaign: number,
  message: string,
  data: any,
) => {
  const url = `${platformUrl}/api/events/`;
  const res = await postJson(url, seriousProtection, {
    campaign,
    message,
    data,
  });
  if (!res.ok) console.warn(res);
};

const postDonation = async (
  version: string,
  platformUrl: string,
  seriousProtection: string | null,
  email: string,
  results: any,
  campaign: string | number,
) => {
  const url = `${platformUrl}/api/donations/`;

  results.version = version;

  const res = await postJson(url, seriousProtection, {
    unauthorized_email: email,
    campaign,
    results,
  });
  if (!res.ok) console.warn(res);
  return res;
};

const postNewsletterSubscription = async (
  platformUrl: string,
  seriousProtection: string | null,
  email: string,
  has_donated: boolean,
  needs_double_optin: boolean,
) => {
  const url = `${platformUrl}/api/mailjetsync/`;

  const res = await postJson(url, seriousProtection, {
    email,
    has_donated,
    needs_double_optin,
  });
  if (!res.ok) console.warn(res);
  return res;
};

export {
  getActiveCampaigns,
  postEvent,
  postDonation,
  postNewsletterSubscription,
};

import fetch from "electron-fetch";
import { toBase64 } from "../../shared/utils/strings";

const fetchBackend = async (url: string) =>
  (
    await fetch(url, {
      headers: {
        Authorization: `Basic ${toBase64(
          `user:${process.env.SERIOUS_PROTECTION}`,
        )}`,
      },
    })
  ).json();

const postBackend = (url: string, data: any) => {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${toBase64(
        `user:${process.env.SERIOUS_PROTECTION}`,
      )}`,
    },
    body: JSON.stringify(data),
  });
};

export { fetchBackend, postBackend };

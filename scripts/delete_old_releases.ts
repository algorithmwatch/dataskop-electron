/**
 * Script to clean up old releases from the S3 object storage. Keeps the latest
 * releases for prod and beta.
 *
 * @module
 */
import {
  DeleteObjectCommand,
  ListObjectsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import dayjs from "dayjs";
import * as _ from "lodash";
import { build } from "../package.json";

const run = async () => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("set env vars");
    return;
  }

  const client = new S3Client({
    region: build.publish.region,
    endpoint: build.publish.endpoint,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const params = {
    Bucket: build.publish.bucket,
  };
  const command = new ListObjectsCommand(params);

  try {
    // get a list of all objects (excluding latest*.yml)
    const objects = ((await (await client.send(command)).Contents) as any[])
      .map(({ Key, LastModified }) => ({
        key: Key,
        lastMod: dayjs(LastModified),
      }))
      .filter((x) => !x.key.endsWith(".yml"));

    const [beta, prod] = _.partition(objects, (x) => x.key.includes("beta"));

    for (const arr of [beta, prod]) {
      const ord = _.orderBy(arr, "lastMod");
      const recentPublished = ord[ord.length - 1];
      let numDeleted = 0;

      for (const x of arr) {
        // Delete objects that are at least 3 days older than the most recently
        // published object.
        if (recentPublished.lastMod.diff(x.lastMod, "day") > 2) {
          const delCommand = new DeleteObjectCommand({
            Bucket: build.publish.bucket,
            Key: x.key,
          });
          await client.send(delCommand);
          numDeleted += 1;
        }
      }

      console.log(`${numDeleted} of ${arr.length} were deleted`);
    }
  } catch (error) {
    console.error(error);
  }
};

run();

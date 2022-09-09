import _ from "lodash";
import { getLastResult } from "renderer/lib/db";

const getStatus = async (): Promise<string> => {
  const row = await getLastResult();
  return _.get(row.fields, "status", "status-not-available") as string;
};

export { getStatus };

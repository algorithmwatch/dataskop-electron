import log from "electron-log";
import _ from "lodash";
import { getAllStati } from "../../db";

const isStatusPending = (status: string) => {
  return [
    "data-pending",
    "monitoring-pending",
    "data-request-success",
    "error-captcha-required", // still keep looking even though an error occured
    "data-pending-error-unable-to-check", // as well
  ].includes(status);
};

const isLastStatusPending = () => {
  const all = getAllStati();
  if (all.length === 0) return false;
  const {
    fields: { status },
  } = _.last(all);
  log.info(`For pending check, got last status ${status}`);
  return isStatusPending(status);
};

export { isLastStatusPending };

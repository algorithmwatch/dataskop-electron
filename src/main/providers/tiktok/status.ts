import log from "electron-log";
import _ from "lodash";
import { isStatusPending } from "../../../shared/status";
import { getAllStati } from "../../db";

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

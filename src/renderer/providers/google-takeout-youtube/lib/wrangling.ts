import { extractIdFromUrl } from "@algorithmwatch/harke-parser";
import _ from "lodash";

const enrichDump = (dump, lookups) => {
  return dump.map((x) => {
    if (!x.titleUrl) return x;
    const vId = `yv${extractIdFromUrl(x.titleUrl)}`;
    const result = _.get(lookups, `${vId}.result`, null);
    x.result = result;
    return x;
  });
};

export { enrichDump };

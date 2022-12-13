import dayjs from "dayjs";
import "dayjs/locale/de";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";

// set dayjs config
dayjs.locale("de");
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

export default dayjs;

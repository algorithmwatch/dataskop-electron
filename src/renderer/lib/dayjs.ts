import dayjs from "dayjs";
import "dayjs/locale/de";
import localizedFormat from "dayjs/plugin/localizedFormat";

// set dayjs config
dayjs.locale("de");
dayjs.extend(localizedFormat);

export default dayjs;

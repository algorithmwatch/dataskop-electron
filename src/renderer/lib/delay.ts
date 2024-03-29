import { randomIntFromInterval } from "../../shared/utils/math";
import { delay } from "../../shared/utils/time";

const delays: { [key: string]: number } = { default: 1000, longer: 5000 };

// can be made more adaptable later on, only used in a couple of cases
const currentDelay = (type = "default") =>
  delay(randomIntFromInterval(delays[type]));

export { currentDelay };

import { randomIntFromInterval } from "./utils/math";
import { delay } from "./utils/time";

const delays: { [key: string]: number } = { default: 5000, longer: 5000 };

// can be made more adaptable later on, only used in a couple of cases
const currentDelay = (type = "default") =>
  delay(randomIntFromInterval(delays[type]));

export { currentDelay };

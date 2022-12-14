// Using Tailwinds defaults
const breakpointsTicks = (width: number) => {
  if (width >= 1536) return 30;
  if (width >= 1280) return 20;
  if (width >= 1024) return 15;
  return 10;
};

const chooseTicks = (values: any[], width: number) => {
  const numTicks = Math.round(values.length / breakpointsTicks(width));

  let ticks = values;
  if (ticks.length > breakpointsTicks(width)) {
    ticks = values.filter((_x: any, i: number) => i % numTicks === 0);
  }
  return ticks;
};

export { chooseTicks };

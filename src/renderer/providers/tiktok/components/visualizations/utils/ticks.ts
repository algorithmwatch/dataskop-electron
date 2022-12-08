const chooseTicks = (values, smallerScreen) => {
  const numTicks = Math.round(values.length / (smallerScreen ? 15 : 30));

  let ticks = values;
  if (ticks.length > (smallerScreen ? 15 : 30)) {
    ticks = values.filter((_x: any, i: number) => i % numTicks === 0);
  }
  return ticks;
};

export { chooseTicks };

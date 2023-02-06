/**
 * A collection of functions for mathematical computations.
 *
 * @module
 */
const medianForArray = (arr: number[]): number => {
  const mid = Math.floor(arr.length / 2);
  const nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const statsForArray = (arri: number[]) => {
  const arr = arri.map((x) => x / 1000);
  const sum = Math.round(arr.reduce((p, c) => p + c, 0));
  const min = Math.round(Math.min(...arr));
  const max = Math.round(Math.max(...arr));
  const average = Math.round(sum / arr.length);
  const median = Math.round(medianForArray(arr));
  return { sum, min, max, average, median };
};

const randomIntFromInterval = (min: number, max?: number) => {
  if (max == null) max = min * 2;
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const isNumeric = (str: string) => {
  return /^\d+$/.test(str);
};

export { medianForArray, statsForArray, randomIntFromInterval, isNumeric };

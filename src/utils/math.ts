const medianForArray = (arr: number[]): number => {
  const mid = Math.floor(arr.length / 2);
  const nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const statsForArray = (arr: number[]) => {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const average = arr.reduce((p, c) => p + c, 0) / arr.length;
  const median = medianForArray(arr);
  return { min, max, average, median };
};

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export { medianForArray, statsForArray, randomIntFromInterval };

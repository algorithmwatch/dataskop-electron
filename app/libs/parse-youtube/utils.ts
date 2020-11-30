/**
 * Get duration in seconds
 *
 * @param s String timestamp
 */
const getDuration = (s: string): number => {
  const sMod = s.replace(/:/g, '.');
  const spl = sMod.split('.');
  if (spl.length === 0) return +spl;

  const sumStr = spl.pop();
  if (sumStr !== undefined) {
    let sum = +sumStr;
    if (spl.length === 1) sum += +spl[0] * 60;
    if (spl.length === 2) {
      sum += +spl[1] * 60;
      sum += +spl[0] * 3600;
    }
    return sum;
  }
  return 0;
};

const extractInteger = (str: string): number | null => {
  const numbers = str.match(/\d/g);
  if (numbers == null) return null;
  return parseInt(numbers.join(''), 10);
};

export { extractInteger, getDuration };

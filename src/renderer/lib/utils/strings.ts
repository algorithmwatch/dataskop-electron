/**
 * A collection of functions for general text processing.
 *
 * @module
 */

const splitByWhitespace = (x: string): Array<string> => x.trim().split(/\s+/);

/**
 * Fixes duplicated strings, e.g. `wordword` to `word`.
 */
const fixDuplicatedString = (x: string): string => {
  if (!(x.length && x.length % 2 == 0)) {
    return x;
  }

  const firstPart = x.slice(0, x.length / 2);
  const secondPart = x.slice(x.length / 2);
  if (firstPart == secondPart) return firstPart;
  else return x;
};

const stripNonAscii = (x: string) => x.replace(/[^a-z0-9]/gi, "");

/**
 * Format bytes as human-readable text.
 * https://stackoverflow.com/a/14919494/4028896
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

const emailRegex = new RegExp(/^\S+@\S+\.\S\S+$/);
const isValidEmail = (x: string) => emailRegex.test(x);

export {
  splitByWhitespace,
  fixDuplicatedString,
  stripNonAscii,
  humanFileSize,
  isValidEmail,
};

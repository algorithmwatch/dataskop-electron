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

const stripNonAscii = (x: string) => x.replace(/[^a-z0-9]/gi, '');

export { splitByWhitespace, fixDuplicatedString, stripNonAscii };

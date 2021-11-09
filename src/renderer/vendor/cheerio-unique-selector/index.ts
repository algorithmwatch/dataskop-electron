// https://github.com/bertyhell/cheerio-get-css-selector/blob/d7437880d635e7c12f758d16759fafa3154e1977/src/get-unique-selector.js

function getElementSelector(el) {
  if (el.attr('id')) {
    return `#${el.attr('id')}`;
  }
  const { tagName } = el.get(0);
  if (tagName === 'body') {
    return tagName;
  }
  if (el.siblings().length === 0) {
    return el.get(0).tagName;
  }
  if (el.index() === 0) {
    return `${el.get(0).tagName}:first-child`;
  }
  if (el.index() === el.siblings().length) {
    return `${el.get(0).tagName}:last-child`;
  }
  return `${el.get(0).tagName}:nth-child(${el.index() + 1})`;
}

function getUniquePath(el, $) {
  const parents = el.parents();
  if (!parents[0]) {
    // Element doesn't have any parents
    return ':root';
  }
  let selector = getElementSelector(el);
  let i = 0;
  let elementSelector;

  if (selector[0] === '#' || selector === 'body') {
    return selector;
  }

  do {
    elementSelector = getElementSelector($(parents[i]));
    selector = `${elementSelector} > ${selector}`;
    i += 1;
  } while (i < parents.length - 1 && elementSelector[0] !== '#'); // Stop before we reach the html element parent
  return selector;
}

export { getUniquePath };

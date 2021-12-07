// https://github.com/node4good/lodash-contrib/blob/91dded5d52f6dca50a4c74782740b02478c2c548/common-js/_.object.builders.js#L27

import _ from 'lodash';

var concat = Array.prototype.concat;

var existy = function (x) {
  return x != null;
};

const renameKeys = (obj, kobj) => {
  return _.reduce(
    kobj,
    function (o, nu, old) {
      if (existy(obj[old])) {
        o[nu] = obj[old];
        return o;
      } else return o;
    },
    _.omit.apply(null, concat.call([obj], _.keys(kobj))),
  );
};

export { renameKeys };

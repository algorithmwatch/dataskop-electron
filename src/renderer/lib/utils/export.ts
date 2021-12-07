/**
 * A collection of functions for exporting data.
 *
 * @module
 */
import _ from 'lodash';
import { ExportToCsv } from 'renderer/vendor/export-to-csv';
import { flatten } from 'renderer/vendor/flat';
import { renameKeys } from 'renderer/vendor/lodash-contrib';
import dayjs from './dayjs';

const exportCsv = ({
  filename,
  data,
  dropColumns = [],
  newColumns = [],
  renameColumns = {},
  transformColumns = _.identity,
  enumerateRows = false,
}: {
  filename: string;
  data: any[];
  dropColumns?: string[];
  newColumns?: string[];
  renameColumns?: { [key: string]: string };
  transformColumns?: (arg0: any) => any;
  enumerateRows?: boolean;
}) => {
  // `__` is Django's way of handling nested objects
  const flatData = data.map((x) => flatten(x, { delimiter: '__' }));

  // 1) get all possible keys form all objects
  // 2) remove columns
  const oldHeaders = _(flatData.map((x) => Object.keys(x)).flat())
    .uniq()
    .pull(...dropColumns)
    .concat(...newColumns)
    .value();

  if (enumerateRows) oldHeaders.unshift('index');

  const headers = _(oldHeaders)
    .map((x) => {
      return _.get(renameColumns, x, x);
    })
    .value();

  // remove, rename and transform columns
  const cleanedData = _(flatData)
    .map((x, i) => {
      // start by 1
      if (enumerateRows) x['index'] = i + 1;
      return x;
    })
    .map(transformColumns)
    .map((x) => renameKeys(x, renameColumns))
    .map((x) => {
      // _.omit will get removed in lodash v5
      return _(x).pick(headers).value();
    })
    // remove empty objects
    .reject(_.isEmpty)
    .value();

  // add missing keys to objects and set a blank value ('')
  const defaultValues = headers.reduce((a, v) => ({ ...a, [v]: '' }), {});

  const finalData = cleanedData.map((x) =>
    Object.assign({ ...defaultValues }, x),
  );

  const csvExporter = new ExportToCsv({
    filename: `dataskop-${filename}-${dayjs().format('YYYY-MM-DD-HH-mm-s')}`,
    showLabels: true,
    headers,
    fieldSeparator: ';', // makes CSV to work with Excel
  });
  csvExporter.generateCsv(finalData);
};

export { exportCsv };

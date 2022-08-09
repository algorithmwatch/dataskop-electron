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
  headers,
  renameColumns = {},
  transformColumns = _.identity,
  enumerateRows = false,
}: {
  filename: string;
  data: any[];
  headers: string[];
  renameColumns?: { [key: string]: string };
  transformColumns?: (arg0: any) => any;
  enumerateRows?: boolean;
}) => {
  // `__` is Django's way of handling nested objects
  const flatData = data.map((x) => flatten(x, { delimiter: '__' }));

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

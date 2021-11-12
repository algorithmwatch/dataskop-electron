/**
 * A collection of functions for exporting data.
 *
 * @module
 */
import _ from 'lodash';
import { ExportToCsv } from '../vendor/export-to-csv';
import { flatten } from '../vendor/flat';
import dayjs from './dayjs';

const exportCsv = (filename: string, data: any[]) => {
  // `__` is Django's way of handling nested objects
  const transformedData = data.map((x) => flatten(x, { delimiter: '__' }));
  // get all possible keys form all objects
  const headers = _.uniq(transformedData.map((x) => Object.keys(x)).flat());
  // add missing keys to objects and set a blank value ('')
  const defaultValues = headers.reduce((a, v) => ({ ...a, [v]: '' }), {});
  const addMissing = transformedData.map((x) =>
    Object.assign(defaultValues, x),
  );

  const csvExporter = new ExportToCsv({
    filename: `dataskop-${filename}-${dayjs().format('YYYY-MM-DD-HH-mm-s')}`,
    useKeysAsHeaders: true,
    fieldSeparator: ';', // makes CSV to work with Excel
  });
  csvExporter.generateCsv(addMissing);
};

export { exportCsv };

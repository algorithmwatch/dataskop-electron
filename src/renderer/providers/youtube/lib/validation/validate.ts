import Ajv from 'ajv';
import schema from './scraping-config-validation.json';

const ajv = new Ajv();

const getValidErrors = (data: any) => {
  const valid = ajv.validate(schema, data);
  if (!valid) return ajv.errors;
  return null;
};

export { getValidErrors };

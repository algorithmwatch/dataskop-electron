import Ajv from "ajv";
import campaignSchema from "./campaign-schema.json";
import ytSchema from "./yt-config-schema.json";

const ajv = new Ajv();

const getValidErrors = (data: any) => {
  const valid = ajv.validate(campaignSchema, data);
  if (!valid) return ajv.errors;

  if (data.config.provider === "youtube") {
    const validYt = ajv.validate(ytSchema, data.config);
    if (!validYt) return ajv.errors;
    return null;
  }

  throw new Error("Not yet implemented");
};

export { getValidErrors };

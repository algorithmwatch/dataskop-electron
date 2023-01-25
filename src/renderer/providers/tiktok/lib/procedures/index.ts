import { actionProcedure } from "./action-procedure";
import { scrapingProcedure } from "./scraping-procedure";

const deserializeMapping = {
  action: actionProcedure,
  scraping: scrapingProcedure,
};

export { deserializeMapping };

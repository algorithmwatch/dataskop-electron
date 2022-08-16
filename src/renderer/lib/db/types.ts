import { ParserResult } from "@algorithmwatch/harke";
import { Campaign, ScrapingConfig } from "../../providers/types";

// re-defining the slug of `ParserResult` from `harke-parser` because the slug is not changable
interface ScrapingResult extends Omit<ParserResult, "slug"> {
  slug: string;
  success: boolean;
}

// A data points that gets saved to disk
interface ScrapingResultSaved extends ScrapingResult {
  sessionId: string;
  scrapedAt: number; // number of millisecconds in UTC
  step: number;
}

// This defines a single run
interface ScrapingSession {
  sessionId: string;
  startedAt: number; // number of millisecconds in UTC
  finishedAt: number | null; // number of millisecconds in UTC
  scrapingConfig: ScrapingConfig; // deprecated, this is now campaign.config
  campaign: Campaign | null;
  questionnaire: any;
}

// A lookup is used to cache a computation
interface LookupItem {
  data: any;
  createdAt: number;
  provider: "youtube";
}

interface LookupMap {
  [key: string]: LookupItem;
}

export { ScrapingResult, ScrapingResultSaved, ScrapingSession, LookupMap };

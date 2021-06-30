import { ParserResult } from '@algorithmwatch/harke';
import { Campaign, ScrapingConfig } from '../providers/types';

// re-defining the slug of `ParserResult` from `harke-parser` because the slug is not changable
interface ScrapingResult extends Omit<ParserResult, 'slug'> {
  slug: string;
  success: boolean;
}

interface ScrapingResultSaved extends ScrapingResult {
  sessionId: string;
  scrapedAt: number; // number of millisecconds in UTC
  step: number;
}

interface ScrapingSession {
  sessionId: string;
  startedAt: number; // number of millisecconds in UTC
  finishedAt: number | null; // number of millisecconds in UTC
  scrapingConfig: ScrapingConfig;
  campaign: Campaign | null;
}

interface Lookup {
  info: any;
  scrapedAt: number;
}

export { ScrapingResult, ScrapingResultSaved, ScrapingSession, Lookup };

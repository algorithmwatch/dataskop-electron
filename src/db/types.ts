import { ParserResult } from '@algorithmwatch/harke';

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
  configSlug: string;
}

export { ScrapingResult, ScrapingResultSaved, ScrapingSession };

import { ParserResult } from '@algorithmwatch/harke-parser/src/types';

type ScrapingResult = ParserResult;

interface ScrapingResultSaved extends ScrapingResult {
  id?: number;
  sessionId: string;
  scrapedAt: number; // number of millisecconds in UTC
}

interface ScrapingSessions {
  id?: number;
  sessionId: string;
  startedAt: number; // number of millisecconds in UTC
}

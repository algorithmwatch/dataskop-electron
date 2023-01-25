import { useEffect, useState } from "react";
import {
  getScrapingResultsBySession,
  getSessions,
  ScrapingSession,
} from "renderer/lib/db";
import { getStatisticsForSession } from "renderer/lib/db/stats";
import DetailsTable from "./DetailsTable";
import Stats from "./Stats";

export default function ResultsDetails({
  sessionId,
}: {
  sessionId: string;
}): JSX.Element {
  const [rows, setRows] = useState<any>([]);
  const [stats, setStats] = useState<any>([]);
  const [session, setSession] = useState<ScrapingSession | null>(null);

  useEffect(() => {
    const newRows = async () => {
      setRows(await getScrapingResultsBySession(sessionId));
      setStats(await getStatisticsForSession(sessionId));
      setSession(
        (await getSessions()).filter((x) => x.sessionId === sessionId)[0],
      );
    };
    newRows();
  }, []);

  return (
    <>
      <div className="overflow-y-auto" style={{ height: "90vh" }}>
        <h2>Session: {sessionId}</h2>
        <div>
          duration:{" "}
          {session &&
            session.finishedAt &&
            (session.finishedAt - session.startedAt) / 1000}
          s
        </div>
        <Stats data={stats} />
        <DetailsTable rows={rows} />
      </div>
    </>
  );
}

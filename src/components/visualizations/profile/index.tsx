import { faIdCard } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { ScrapingResult } from '../../../db/types';
import Explainer from '../../Explainer';
import Infobox from '../../Infobox';
import Beeswarm from './Beeswarm';
import { useData } from './useData';

function Badge({ title, value, unit, small = false }) {
  return (
    <div className="flex flex-col shadow rounded-lg text-center w-45 overflow-hidden">
      <div className="p-2 backdrop-filter backdrop-contrast-125 backdrop-brightness-110 backdrop-saturate-200 flex justify-center items-center flex-grow flex-row">
        <div>
          <span className={small ? 'hl-1xl font-bold' : 'hl-3xl'}>{value}</span>{' '}
          <span className="text-xs ">{unit}</span>
        </div>
      </div>
      <div className="p-2 text-xs text-yellow-1300  backdrop-filter backdrop-saturate-50">
        {title}
      </div>
    </div>
  );
}

export default function StatisticsChart({
  data,
}: {
  data: Array<ScrapingResult>;
}) {
  const [explainerIsOpen, setExplainerIsOpen] = useState(true);
  const db = useData(data);

  if (!db.history) return null;

  return (
    <>
      <Explainer
        isOpen={explainerIsOpen}
        onIsOpenChange={(val: boolean) => setExplainerIsOpen(val)}
      >
        <FontAwesomeIcon icon={faIdCard} size="6x" className="text-blue-200" />
        <div className="max-w-prose">
          <h1 className="hl-4xl my-6">Mein YouTube-Profil</h1>
          <div className="space-y-4">
            <p>
              Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas
              Böses getan hätte, wurde er eines Morgens verhaftet. »Wie ein
              Hund!« sagte er, es war, als sollte die Scham ihn überleben.
            </p>
            <p>
              Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas
              Böses getan hätte, wurde er eines Morgens verhaftet. »Wie ein
              Hund!« sagte er, es war, als sollte die Scham ihn überleben.
            </p>
            <div>
              <Infobox>
                <p>
                  Jemand musste Josef K. verleumdet haben, denn ohne dass er
                  etwas Böses getan hätte, wurde er eines Morgens verhaftet.
                  »Wie ein Hund!« sagte er, es war, als sollte die Scham ihn
                  überleben.
                </p>
              </Infobox>
            </div>
          </div>
        </div>
      </Explainer>
      <div className="cursor-default">
        <div className="m-7 mt-0 grid grid-cols-8 gap-4">
          <Badge title="Zeitraum" value={db.days} unit="Tage" />
          <Badge title="Videos" value={db.history?.length} unit="" />
          <Badge
            title="geschaut insgesamt"
            value={Math.round(db.watchTime)}
            unit="Minuten"
          />
          <Badge
            title="Ø Videolänge"
            value={Math.round(db.watchPercentAverage)}
            unit="%"
          />
          <Badge
            title="Ø Minuten pro Video"
            value={Math.round(db.watchTimeAverage)}
            unit="minutes"
          />

          <Badge
            title="Kategoriefavorit"
            value={db.mostWatchedCategoriesTime[0][0]}
            small
            unit=""
          />
          <Badge title="Abonnierte Kanäle" value={db.channels.length} unit="" />
          {/* <Badge
          title="width notifications"
          value={db.channelsNotification.length}
          unit="channels"
        /> */}
          {db.topChannel && (
            <Badge
              title="Kanalfavorit"
              value={db.topChannel.name}
              small
              unit=""
            />
          )}
        </div>
        <div className="m-7 mb-0 text-xs text-yellow-1300 p-2 shadow rounded-lg backdrop-filter backdrop-opacity-80 backdrop-contrast-125 backdrop-brightness-110 backdrop-saturate-200">
          <Beeswarm data={db.history} />
        </div>
      </div>
    </>
  );
}

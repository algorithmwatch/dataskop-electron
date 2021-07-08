import React from 'react';
import { ScrapingResult } from '../../db/types';

export default function StatisticsChart({
  data,
}: {
  data: Array<ScrapingResult>;
}) {
  console.log(data);
  return (
    <div className="cursor-default w-4/5 self-center h-full">
      <div className="grid grid-cols-2 gap-10 h-full">
        <div>
          <div className="hl-2xl mb-4">
            Diese Daten wurden von dir gesammelt
          </div>
          <div className="mb-4">
            Du siehst hier exakt die Daten in dem Format, wie du sie gleich
            spenden kannst.
          </div>
          <div className="divide-y-2 divide-yellow-600 divide-dashed">
            <div className="p-2 ">24 Kanäle, denen du folgst</div>
            <div className="p-2 ">
              Die letzten 50 Videos, die du gesehen hast
            </div>
            <div className="p-2 ">12 Videos mit insgesamt 120 Empfehlung</div>
            <div className="p-2 ">8 Suchbegriffe mit insg. 80 Ergebnissen</div>
          </div>
          <div className="mt-8">Datenmenge: 1,3 MB</div>
        </div>

        <div className="bg-gray-50 flex relative flex-col p-4 border-black border-dashed border ">
          <div>JSON-Preview</div>
          <div className="bg-white flex-grow w-full mt-2 h-20 overflow-scroll">
            <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

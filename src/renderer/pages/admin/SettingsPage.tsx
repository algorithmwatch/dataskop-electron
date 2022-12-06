import _ from "lodash";
import { useEffect, useState } from "react";
import { humanFileSize } from "renderer/lib/utils/strings";
import Button from "renderer/providers/youtube/components/Button";
import { useConfig } from "../../contexts";

export default function SettingsPage(): JSX.Element {
  const {
    state: { platformUrl, userConfig },
    dispatch: dipatchConfig,
  } = useConfig();

  const [exportOngoing, setExportOngoing] = useState(false);
  const [storage, setStorage] = useState<string>("calculating...");

  useEffect(() => {
    (async () =>
      setStorage(
        humanFileSize(
          _.sum(await window.electron.ipc.invoke("export-debug-size")),
        ),
      ))();
  }, []);

  return (
    <div className="m-10">
      <h1 className="text-5xl">Settings</h1>

      {userConfig && (
        <div className="grid grid-cols-5 gap-4">
          <div className="m-5">
            <div>Start on login: {userConfig.openAtLogin ? "yes" : "no"}</div>
            <Button
              onClick={() =>
                dipatchConfig({
                  type: "set-user-config",
                  newValues: {
                    openAtLogin: !userConfig.openAtLogin,
                  },
                })
              }
            >
              Toggle
            </Button>
          </div>
          <div className="m-5" id="debug-logging">
            <div>Debug logging: {userConfig.debugLogging ? "yes" : "no"}</div>
            <Button
              onClick={() =>
                dipatchConfig({
                  type: "set-user-config",
                  newValues: {
                    debugLogging: !userConfig.debugLogging,
                  },
                })
              }
            >
              Toggle
            </Button>
          </div>
          <div className="m-5" id="html-logging">
            <div>HTML logging: {userConfig.htmlLogging ? "yes" : "no"}</div>
            <Button
              onClick={() =>
                dipatchConfig({
                  type: "set-user-config",
                  newValues: {
                    htmlLogging: !userConfig.htmlLogging,
                  },
                })
              }
            >
              Toggle
            </Button>
          </div>
          <div className="m-5">
            <div>Monitoring: {userConfig.monitoring ? "yes" : "no"}</div>
          </div>
          <div className="m-5">
            <div>
              Monitoring Interval:{" "}
              {userConfig.monitoringInterval ? "yes" : "no"}
            </div>
          </div>
        </div>
      )}

      <hr />

      <div className="pt-10">Platform url: {platformUrl}</div>
      <div className="pt-10 pb-10">
        <Button onClick={() => window.electron.ipc.invoke("update-check-beta")}>
          Check beta update
        </Button>
      </div>

      <hr />

      <div className="pt-10 pb-10">
        <Button
          disabled={exportOngoing}
          onClick={async () => {
            setExportOngoing(true);
            await window.electron.ipc.invoke("export-debug-archive");
            setExportOngoing(false);
          }}
        >
          Export debug archive
        </Button>
        {exportOngoing && "Exporting..."}
      </div>

      <div className="pb-20">Storage of debug files: {storage}</div>

      <div className="pl-10 pt-5 pb-5 bg-red-700 text-white bold">
        DANGER!!!
        <div className="pt-10 pb-10">
          <Button
            onClick={() => {
              window.electron.ipc.invoke("export-debug-clean");
            }}
          >
            Remove debug files (logs, html)
          </Button>
        </div>
      </div>
    </div>
  );
}

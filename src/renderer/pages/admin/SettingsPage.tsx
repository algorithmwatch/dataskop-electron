import _ from "lodash";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import { humanFileSize } from "renderer/lib/utils/strings";
import { useConfig } from "../../contexts";

const SettingsPage = (): JSX.Element => {
  const {
    state: { platformUrl, userConfig },
    dispatch: dipatchConfig,
  } = useConfig();

  const history = useHistory();

  const [exportOngoing, setExportOngoing] = useState(false);
  const [storage, setStorage] = useState([0, 0, 0, 0]);
  const [log, setLog] = useState("loading");
  const [files, setFiles] = useState({
    db: "loading",
    downloads: "loading",
    html: "loading",
    log: "loading",
  });

  useEffect(() => {
    (async () => {
      const infos = await window.electron.ipc.invoke("export-file-infos");
      setStorage(infos.sizes);
      setLog(infos.logContent);
      setFiles(infos.files);
    })();
  }, []);

  return (
    <div className="m-20">
      <Button
        theme="text"
        onClick={() => {
          history.goBack();
        }}
      >
        {"< Go back"}
      </Button>
      <h1 className="text-5xl my-5">Advanced Settings</h1>

      {userConfig && (
        <>
          <div className="grid grid-cols-5 gap-4">
            <div className="my-5">
              <div>Start on login: {userConfig.openAtLogin ? "yes" : "no"}</div>
              <Button
                size="sm"
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
            <div className="my-5">
              <div>Debug logging: {userConfig.debugLogging ? "yes" : "no"}</div>
              <Button
                size="sm"
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
            <div className="my-5">
              <div>HTML logging: {userConfig.htmlLogging ? "yes" : "no"}</div>
              <Button
                size="sm"
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
            <div className="my-5">
              <div>
                scrapingForceOpen: {userConfig.scrapingForceOpen ? "yes" : "no"}
              </div>
              <Button
                size="sm"
                onClick={() =>
                  dipatchConfig({
                    type: "set-user-config",
                    newValues: {
                      scrapingForceOpen: !userConfig.scrapingForceOpen,
                    },
                  })
                }
              >
                Toggle
              </Button>
            </div>
            <div className="my-5">
              <div>
                scrapingOpenDevTools:{" "}
                {userConfig.scrapingOpenDevTools ? "yes" : "no"}
              </div>
              <Button
                size="sm"
                onClick={() =>
                  dipatchConfig({
                    type: "set-user-config",
                    newValues: {
                      scrapingOpenDevTools: !userConfig.scrapingOpenDevTools,
                    },
                  })
                }
              >
                Toggle
              </Button>
            </div>
          </div>
          <hr />
          <div className="my-5">
            <span className="mr-5">
              Monitoring: {userConfig.monitoring ? "yes" : "no"}
            </span>
            <span>
              Monitoring Interval:{" "}
              {userConfig.monitoringInterval ? "yes" : "no"}
            </span>
            <span className="ml-5">
              Platform url: {platformUrl}
              <Button
                className="ml-10"
                size="xs"
                onClick={() => window.electron.ipc.invoke("update-check-beta")}
              >
                Check beta update
              </Button>
            </span>
            <span>
              <Button
                className="ml-5"
                size="xs"
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
            </span>
          </div>
        </>
      )}

      <hr />

      <div className="mt-5">DB: {files.db}</div>
      <div className="mt-1">HTML: {files.html}</div>
      <div className="mt-1">Downloads: {files.downloads}</div>
      <div className="mt-1">Log: {files.log}</div>
      <div className="my-1 whitespace-pre-line overflow-y-auto h-64 border-solid border-2 gray-100 p-1">
        {log}
      </div>

      <hr />

      <div className="mt-10 p-10 bg-red-900 text-white bold">
        <h1 className="text-xl mb-5">DANGER!!!</h1>

        <Button
          size="sm"
          onClick={() => {
            window.electron.ipc.invoke("export-remove-debug-files");
          }}
        >
          Remove debug files (logs, html):{" "}
          {humanFileSize(_.sum(storage.slice(0, 2)))}
        </Button>
        <Button
          className="ml-10"
          size="sm"
          onClick={() => {
            window.electron.ipc.invoke("export-remove-all-files");
          }}
        >
          Remove all files: {humanFileSize(_.sum(storage))}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;

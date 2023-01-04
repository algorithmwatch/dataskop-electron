import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import { getLocalCampaigns, modifyLocalCampaigns } from "renderer/lib/db";
import { getValidErrors } from "renderer/lib/validation";
import { Campaign } from "renderer/providers/types";
import { defaultCampaign } from "renderer/providers/youtube";
import Button from "renderer/providers/youtube/components/Button";

const ScrapingConfigEditorPage = (): JSX.Element => {
  const [rows, setRows] = useState<Campaign[]>([]);
  const [editJson, setEditJson] = useState<Campaign | null>(null);
  const [error, setError] = useState<any>(null);

  const loadData = async () => {
    setRows(await getLocalCampaigns());
  };

  const newConfig = async () => {
    const slug = `youtube-${dayjs().format("YYYY-MM-DD-HH-mm-s")}`;
    const config = { ...defaultCampaign, slug, title: slug };
    await modifyLocalCampaigns(config);
    loadData();
  };

  const updateConfig = async (e: any) => {
    if (e.updated_src === null) return;

    const newError = getValidErrors(e.updated_src);
    if (newError === null) {
      await modifyLocalCampaigns(e.updated_src);
      loadData();
      setError(null);
    } else {
      setError(newError);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="overflow-y-auto mt-20 mx-10">
      <Card>
        <CardHeader title="Scraping Advanced Configuration" />
        <CardContent>
          <p>
            This is an advanced configuration tool for the scraping. This tool
            is not used for the end user of DataSkop.
          </p>
          <Button onClick={newConfig}>New Config</Button>
        </CardContent>
        <CardContent>
          {error && (
            <div className="text-red-700 whitespace-pre">
              {JSON.stringify(error, null, 2)}
            </div>
          )}
        </CardContent>
        <CardContent>
          {editJson && (
            <ReactJson
              src={editJson}
              onAdd={updateConfig}
              onEdit={updateConfig}
              onDelete={updateConfig}
            />
          )}
        </CardContent>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell align="right">Slug</TableCell>
                  <TableCell align="right">Steps</TableCell>
                  <TableCell align="right">Edit</TableCell>
                  <TableCell align="right">Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.slug}>
                    <TableCell component="th" scope="row">
                      {row.title}
                    </TableCell>
                    <TableCell align="right">{row.slug}</TableCell>
                    <TableCell align="right">
                      {row.config.steps.length}
                    </TableCell>
                    <TableCell align="right">
                      <Button onClick={() => setEditJson(row)}>Edit</Button>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        onClick={async () => {
                          await modifyLocalCampaigns(row, true);
                          loadData();
                        }}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingConfigEditorPage;

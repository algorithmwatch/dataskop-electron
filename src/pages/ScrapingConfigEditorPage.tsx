/* eslint-disable no-restricted-syntax */
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
} from '@material-ui/core';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import ReactJson from 'react-json-view';
import Button from '../components/Button';
import { getStoredScrapingConfigs, modifyScrapingConfig } from '../db';
import { ScrapingConfig } from '../providers/types';
import { defaultConfig } from '../providers/youtube';
import { getValidErrors } from '../providers/youtube/validation/validate';

export default function ScrapingConfigEditorPage(): JSX.Element {
  const [rows, setRows] = useState<ScrapingConfig[]>([]);
  const [editJson, setEditJson] = useState<ScrapingConfig | null>(null);
  const [error, setError] = useState<any>(null);

  const loadData = async () => {
    setRows(await getStoredScrapingConfigs());
  };

  const newConfig = async () => {
    const config = defaultConfig;
    config.slug = `youtube-${dayjs().format('YYYY-MM-DD-HH-mm-s')}`;
    config.title = `youtube-${dayjs().format('YYYY-MM-DD-HH-mm-s')}`;
    await modifyScrapingConfig(config);
    loadData();
  };

  const updateConfig = async (e) => {
    if (e.updated_src === null) return;

    const newError = getValidErrors(e.updated_src);
    if (newError === null) {
      await modifyScrapingConfig(e.updated_src);
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
    <>
      <div className="overflow-y-auto">
        <Card>
          <CardHeader title="Scraping Advanced Configuration" />
          <CardContent>
            <p>
              This is an advancaded configuration tool for the scraping. This
              tool is not used for the end user of DataSkop.
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
                      <TableCell align="right">{row.steps.length}</TableCell>
                      <TableCell align="right">
                        <Button onClick={() => setEditJson(row)}>Edit</Button>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          onClick={async () => {
                            await modifyScrapingConfig(row, true);
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
    </>
  );
}

/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
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
import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import Button from '../components/Button';
import {
  addOrUpdateStoredScrapingConfig,
  getStoredScrapingConfigs,
} from '../db';
import { defaultConfig, ScrapingConfig } from '../providers/youtube';

export default function ScrapingConfigEditorPage(): JSX.Element {
  const [rows, setRows] = useState<ScrapingConfig[]>([]);
  const [editJson, setEditJson] = useState<ScrapingConfig | null>(null);

  const newConfig = async () => {
    const config = defaultConfig;
    config.slug = `youtube-${dayjs().format('YYYY-MM-DD-HH-mm-s')}`;
    await addOrUpdateStoredScrapingConfig(config);
    setRows(await getStoredScrapingConfigs());
  };

  const updateConfig = async (e) => {
    if (e.updated_src === null) return;
    await addOrUpdateStoredScrapingConfig(e.updated_src);
    setRows(await getStoredScrapingConfigs());
  };

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

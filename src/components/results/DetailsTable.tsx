/* eslint-disable no-return-assign */
/* eslint-disable react/jsx-key */
/* eslint-disable react/jsx-props-no-spreading */
import { faCaretDown, faCaretUp } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Collapse, IconButton, Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import dayjs from 'dayjs';
import React from 'react';

function Row({ row }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <FontAwesomeIcon icon={faCaretUp} />
            ) : (
              <FontAwesomeIcon icon={faCaretDown} />
            )}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.slug}
        </TableCell>
        <TableCell align="right">{row.scrapedAt}</TableCell>
        <TableCell align="right">{row.success ? 'yes' : 'no'}</TableCell>
        <TableCell align="right">{JSON.stringify(row.errors)}</TableCell>
        {/* <TableCell align="right">{row.protein}</TableCell> */}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                Fields
              </Typography>
              <div className="whitespace-pre">
                {JSON.stringify(row.fields, null, 2)}
              </div>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function DetailsTable({ rows }) {
  rows.forEach((x) => (x.scrapedAt = dayjs(x.scrapedAt).format()));
  console.log(rows[0]);
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>slug</TableCell>
            <TableCell align="right">scraped at</TableCell>
            <TableCell align="right">success</TableCell>
            <TableCell align="right">errors</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <Row key={row.scrapedAt} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

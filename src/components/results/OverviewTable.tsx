import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import dayjs from 'dayjs';
import React from 'react';
import { useHistory } from 'react-router';
import routes from '../../constants/routes.json';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

export default function OverviewTable({ rows }) {
  const classes = useStyles();
  const history = useHistory();

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Session ID</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Number of Items</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              className="cursor-pointer"
              key={row.id}
              onClick={() =>
                history.push(
                  routes.RESULTS_DETAILS.replace(':sessionId', row.id),
                )
              }
            >
              <TableCell component="th" scope="row">
                {row.id}
              </TableCell>
              <TableCell>{dayjs(row.scrapedAt).format()}</TableCell>
              <TableCell>{row.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

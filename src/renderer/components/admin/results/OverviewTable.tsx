import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import dayjs from 'dayjs';
import { useHistory } from 'react-router';
import routes from '../../../routes';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

export default function OverviewTable({ rows }: { rows: any }) {
  const classes = useStyles();
  const history = useHistory();

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Session ID</TableCell>
            <TableCell>Config Slug</TableCell>
            <TableCell>Started At</TableCell>
            <TableCell>Duation</TableCell>
            <TableCell>Number of Items</TableCell>
            <TableCell>Campaign</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row: any) => (
            <TableRow
              className="cursor-pointer"
              key={row.sessionId}
              onClick={() =>
                history.push(
                  routes.ADMIN_RESULTS_DETAILS.path.replace(
                    ':sessionId',
                    row.sessionId,
                  ),
                )
              }
            >
              <TableCell component="th" scope="row">
                {row.sessionId}
              </TableCell>
              <TableCell>
                {row.scrapingConfig && row.scrapingConfig.slug}
              </TableCell>
              <TableCell>{dayjs(row.startedAt).format()}</TableCell>
              <TableCell>
                {row.finishedAt &&
                  `${(row.finishedAt - row.startedAt) / 1000}s`}
              </TableCell>
              <TableCell>{row.count}</TableCell>
              <TableCell>{JSON.stringify(row.campaign)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/* eslint-disable no-return-assign */
/* eslint-disable react/jsx-key */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { useTable } from 'react-table';

type TableProps = {
  data: Array<ScrapingResultSaved>;
};

export default function SessionTable({ data }: TableProps): JSX.Element {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Scraped at',
        accessor: 'scrapedAt',
      },
      {
        Header: 'Session ID',
        accessor: 'sessionId',
      },
      {
        Header: 'Task',
        accessor: 'task',
      },
      {
        Header: 'Result',
        accessor: 'result',
      },
      {
        Header: 'Error',
        accessor: 'errorMessage',
      },
    ],
    [],
  );

  data.forEach((x) => (x.result = JSON.stringify(x.result)));
  data.forEach((x) => (x.scrapedAt = new Date(x.scrapedAt).toString()));

  const tableInstance = useTable({ columns, data });
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <table {...getTableProps()} className="table">
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

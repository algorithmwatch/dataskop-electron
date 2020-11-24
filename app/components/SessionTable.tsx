import React, { useState, useRef, useEffect } from 'react';

import { useTable } from 'react-table';

import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
// import styles from './Home.css';

export default function SessionTable({ data }): JSX.Element {
  // const tableData = React.useMemo(
  //   () => [
  //     {
  //       col1: 'Hello',

  //       col2: 'World',
  //     },
  //     {
  //       col1: 'react-table',

  //       col2: 'rocks',
  //     },
  //     {
  //       col1: 'whatever',

  //       col2: 'you want',
  //     },
  //   ],
  //   []
  // );

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
        Header: 'Items',

        accessor: 'items',
      },
    ],

    []
  );

  data.forEach((x) => (x.items = JSON.stringify(x.items)));

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
        {
          // Loop over the header rows

          headerGroups.map((headerGroup) => (
            // Apply the header row props

            <tr {...headerGroup.getHeaderGroupProps()}>
              {
                // Loop over the headers in each row

                headerGroup.headers.map((column) => (
                  // Apply the header cell props

                  <th {...column.getHeaderProps()}>
                    {
                      // Render the header

                      column.render('Header')
                    }
                  </th>
                ))
              }
            </tr>
          ))
        }
      </thead>

      {/* Apply the table body props */}

      <tbody {...getTableBodyProps()}>
        {
          // Loop over the table rows

          rows.map((row) => {
            // Prepare the row for display

            prepareRow(row);

            return (
              // Apply the row props

              <tr {...row.getRowProps()}>
                {
                  // Loop over the rows cells

                  row.cells.map((cell) => {
                    // Apply the cell props

                    return (
                      <td {...cell.getCellProps()}>
                        {
                          // Render the cell contents

                          cell.render('Cell')
                        }
                      </td>
                    );
                  })
                }
              </tr>
            );
          })
        }
      </tbody>
    </table>
  );
}

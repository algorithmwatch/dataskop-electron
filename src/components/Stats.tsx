import React from 'react';

export default function Stats({ data }): JSX.Element {
  return (
    <div>
      {Object.entries(data).map((x) => (
        <div key={x[0]}>
          {x[0]} {JSON.stringify(x[1])}
        </div>
      ))}
    </div>
  );
}

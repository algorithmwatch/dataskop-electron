import React from 'react';

export default function Stats({ data }): JSX.Element {
  if (data == null || data.steps == null || data.slugs == null) return null;
  return (
    <div>
      <div>
        <h2>steps, in seconds</h2>
        {Object.entries(data.steps).map((x) => (
          <div key={x[0]}>
            {x[0]} {JSON.stringify(x[1])}
          </div>
        ))}
      </div>
      <div>
        <h2>slugs, in seconds</h2>
        {Object.entries(data.slugs).map((x) => (
          <div key={x[0]}>
            {x[0]} {JSON.stringify(x[1])}
          </div>
        ))}
      </div>
    </div>
  );
}

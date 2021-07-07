import classNames from 'classnames';
import React, { ReactNode } from 'react';

function ContentWrapper({
  centerY,
  children,
}: {
  centerY?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={classNames(
        'mx-auto max-w-prose flex flex-col justify-center',
        centerY ? 'h-full' : 'my-10',
      )}
    >
      <div>{children}</div>
    </div>
  );
}

export default ContentWrapper;

import React, { ReactNode } from 'react';

function SidebarBackground({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="absolute inset-0 bg-yellow-1200 bg-opacity-50 z-50">
      {children}
    </div>
  );
}

export default function Sidebar({
  isOpen = false,
}: {
  isOpen?: boolean;
}): JSX.Element {
  return <SidebarBackground>das ist das menü</SidebarBackground>;
}

import { ReactNode } from "react";
import Header from "renderer/components/Header";

export default function BaseLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div>
      <Header />

      {/* <main className="flex flex-grow flex-col justify-between overflow-auto pt-4 pb-2"> */}
      <main className="">{children}</main>
    </div>
  );
}

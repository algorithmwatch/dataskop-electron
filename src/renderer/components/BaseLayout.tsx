export default function BaseLayout({ children }): JSX.Element {
  return (
    <div>
      <h1>To be done</h1>
      <main className="flex flex-grow flex-col justify-between overflow-auto pt-4 pb-2">
        {children}
      </main>
    </div>
  );
}

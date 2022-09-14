export const VizBox = ({
  head,
  label,
}: {
  head: number | string;
  label: string;
}) => {
  return (
    <div className="card">
      <div className="px-10 py-4">
        <div className="font-bold text-xl mb-2">
          <b>{head}</b>
        </div>
        <p className="text-gray-700 text-base">{label}</p>
      </div>
    </div>
  );
};

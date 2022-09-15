export const VizBox = ({
  head,
  label,
}: {
  head: number | string;
  label: string;
}) => {
  return (
    <div className="flex rounded-lg p-1 min-w-[9rem] bg-gradient-to-br from-[#B5FFFD] to-[#FFB8CE]">
      <div className="grow rounded-md bg-white py-4 flex flex-col items-center">
        <div className="font-bold text-4xl mx-4 whitespace-nowrap">{head}</div>
        <p className="text-gray-700 text-lg">{label}</p>
      </div>
    </div>
  );
};

const VizBox = ({ head, label }: { head: number | string; label: string }) => {
  return (
    <div className="flex rounded-lg p-1 min-w-[7rem] lg:min-w-[7rem] 2xl:min-w-[9rem] bg-gradient-to-br from-[#B5FFFD] to-[#FFB8CE]">
      <div className="grow rounded-md bg-white py-2 2xl:py-4 flex flex-col items-center">
        <div className="font-bold text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl mx-4 whitespace-nowrap">
          {head}
        </div>
        <p className="text-gray-700 text-base lg:text-lg px-1">{label}</p>
      </div>
    </div>
  );
};

const VizBoxRow = ({ values }) => {
  return (
    <div className="flex mx-auto space-x-4 mb-3 lg:mb-6">
      {values.map(({ head, label }) => (
        <VizBox key={label} head={head} label={label} />
      ))}
    </div>
  );
};

export { VizBoxRow };

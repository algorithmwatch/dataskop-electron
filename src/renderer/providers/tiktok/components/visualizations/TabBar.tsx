const TabBar = ({ datasource, setDatasource, options }) => {
  return (
    <div className="flex items-center justify-center">
      <div
        className="inline-flex rounded-lg p-1 bg-gradient-to-br from-[#B5FFFD] to-[#FFB8CE]"
        role="group"
      >
        {options.map((x) => {
          return (
            <button
              type="button"
              key={x[0]}
              onClick={() => setDatasource(x[0])}
              className={`
            min-w-[12rem] grow rounded-l-md py-2 flex flex-col items-center capitalize
        ${
          datasource === x[0]
            ? "bg-gradient-to-b from-white via-white to-transparent font-semibold"
            : "opacity-80"
        }
        `}
            >
              {x[1]}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabBar;

const ProgressBar = ({ value, eta }: { value: number; eta?: number }) => {
  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="w-64 h-10 relative flex items-center cursor-pointer group my-5">
          <div className="z-0 absolute bottom-0 inset-x-0 h-2 bg-east-blue-300 rounded">
            <div
              className="bg-east-blue-700 h-full rounded"
              style={{ width: `${value * 100}%` }}
            />
          </div>
        </div>
      </div>
      {eta && (
        <div className="w-full text-sm text-center">
          Ungefähr noch {eta <= 2 ? "wenige" : eta} Minuten verbleibend...
        </div>
      )}
    </div>
  );
};

export default ProgressBar;

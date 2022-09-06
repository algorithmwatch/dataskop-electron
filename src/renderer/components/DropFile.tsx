/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/label-has-associated-control */

import clsx from "clsx";
import { ReactNode, useState } from "react";
import { useDropArea } from "react-use";

const DropFile = ({
  handleFiles,
  dropDone,
  children,
}: {
  handleFiles: (files: File[]) => void;
  dropDone: boolean;
  children: ReactNode;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [bond, state] = useDropArea({
    onFiles: handleFiles,
  });
  const handleDragEnter = () => {
    if (dropDone) return;
    setIsDragOver(true);
  };
  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    if (dropDone) return;
    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget.contains(event.relatedTarget as Node)) return;

    setIsDragOver(false);
  };

  return (
    <div className="mx-auto grow flex" {...bond}>
      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={() => setIsDragOver(false)}
        className={clsx(
          "grow flex flex-col items-center justify-center w-full px-20 transition bg-white border-4 border-dashed rounded-3xl appearance-none focus:outline-none",
          isDragOver
            ? "border-east-blue-700 bg-neutral-100"
            : "border-neutral-300 hover:border-neutral-200",
          !dropDone && "cursor-pointer",
        )}
      >
        {children}
        {!dropDone && (
          <input
            type="file"
            name="file_upload"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(Array.from(e.target.files));
            }}
          />
        )}
      </label>
    </div>
  );
};

export default DropFile;

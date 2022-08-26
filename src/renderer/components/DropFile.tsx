/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/label-has-associated-control */

import { ReactNode } from "react";
import { useDropArea } from "react-use";

const handleFiles = (files: File[]) => {
  return window.electron.ipc.invoke(
    "import-files",
    files.map(({ path }) => path),
  );
};

const DropFile = ({ children }: { children: ReactNode }) => {
  const [bond, state] = useDropArea({
    onFiles: (files) => handleFiles(files),
  });

  return (
    <div className="mx-auto grow flex" {...bond}>
      <label className="grow flex flex-col items-center justify-center w-full px-20 transition bg-white border-4 border-neutral-300 border-dashed rounded-3xl appearance-none cursor-pointer hover:border-neutral-200 focus:outline-none">
        {children}
        <input
          type="file"
          name="file_upload"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(Array.from(e.target.files));
          }}
        />
      </label>
    </div>
  );
};

export default DropFile;

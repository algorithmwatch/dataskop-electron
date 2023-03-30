// https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/2955#issuecomment-907397111
declare global {
  interface Window {
    electron: any;
    log: any;
    persistEmail: string;
    hasDonated: boolean | null;
    clearImports: true | undefined;
    notEligibleToDonate: true | null;
    reachedEnd: true | null;
    viz1modalHide: true | undefined;
    viz2modalHide: true | undefined;
    viz3modalHide: true | undefined;
  }
}
export {};

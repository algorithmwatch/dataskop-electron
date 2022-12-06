// https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/2955#issuecomment-907397111
declare global {
  interface Window {
    electron: any;
    log: any;
    persistEmail: string;
    hasDonated: boolean | null;
    notEligibleToDonate: true | null;
  }
}
export {};

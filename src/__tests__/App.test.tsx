import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import App from '../renderer/App';

describe('App', () => {
  it('should render', () => {
    window.electron = {};
    window.electron.procEnv = '{}';
    window.electron.ipcRenderer = {};
    window.electron.ipcRenderer.invoke = () => console.log('mock invoke');
    window.electron.ipcRenderer.on = () => console.log('mock on');
    window.electron.ipcRenderer.removeAllListeners = () =>
      console.log('mock removeAllListeners');
    window.electron.ipcRenderer.removeListener = () =>
      console.log('mock removeListener');
    expect(render(<App />)).toBeTruthy();
  });
});

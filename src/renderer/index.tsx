import { render } from 'react-dom';
import App from './App';

const eleRoot = document.getElementById('root');
if (eleRoot !== null) render(<App />, eleRoot);

import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import './App.global.css';
import BaseLayoutSwitch from './components/BaseLayoutSwitch';
import ScrapingAttached from './components/scraping/ScrapingAttached';
import UpdateNotification from './components/UpdateNotification';
import {
  ConfigProvider,
  ModalProvider,
  NavigationProvider,
  ScrapingProvider,
} from './contexts';
import routes, { allRoutes } from './routes';

export default function App() {
  return (
    <ConfigProvider>
      <NavigationProvider>
        <ModalProvider>
          <ScrapingProvider>
            <UpdateNotification />
            <Router>
              <BaseLayoutSwitch>
                <Switch>
                  {/* All routes */}
                  {allRoutes.map(({ path, comp }) => (
                    <Route path={path} component={comp} key={path} />
                  ))}
                  {/* Redirect initial route */}
                  <Route path="/">
                    <Redirect to={routes.SELECT_CAMPAIGN.path} />
                  </Route>
                </Switch>
              </BaseLayoutSwitch>
            </Router>
            {/* has to come here _after_ the pages in the router */}
            <ScrapingAttached />
          </ScrapingProvider>
        </ModalProvider>
      </NavigationProvider>
    </ConfigProvider>
  );
}

import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import './App.global.css';
import ScrapingAttached from './components/scraping/ScrapingAttached';
import UpdateNotification from './components/UpdateNotification';
import {
  ConfigProvider,
  ModalProvider,
  NavigationProvider,
  ScrapingProvider,
} from './contexts';
import BaseLayout from './layout/Base';
import routes, { allRoutes } from './routes';

export default function App() {
  return (
    <ConfigProvider>
      <NavigationProvider>
        <ModalProvider>
          <ScrapingProvider>
            <UpdateNotification />
            <Router>
              <BaseLayout>
                <Switch>
                  {/* All routes */}
                  {allRoutes.map(({ path, comp }) => (
                    <Route path={path} component={comp} key={path} />
                  ))}
                  {/* Redirect initial route to start route */}
                  <Route path="/">
                    <Redirect to={routes.START.path} />
                  </Route>
                </Switch>
              </BaseLayout>
            </Router>
            {/* has to come here _after_ the pages in the router */}
            <ScrapingAttached />
          </ScrapingProvider>
        </ModalProvider>
      </NavigationProvider>
    </ConfigProvider>
  );
}

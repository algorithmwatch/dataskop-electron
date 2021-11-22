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
import ytRoutes from './providers/youtube/lib/routes';
import routes from './routes';

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
                  {/* YouTube routes */}
                  {Object.values(ytRoutes).map(({ path, comp }) => (
                    <Route path={path} component={comp} key={path} />
                  ))}
                  {/* Global routes */}
                  {Object.values(routes).map(({ path, comp }) => (
                    <Route path={path} component={comp} key={path} />
                  ))}
                  {/* Start route */}
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

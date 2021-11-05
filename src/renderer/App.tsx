import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import './App.global.css';
import ScrapingAttached from './components/scraping/ScrapingAttached';
import UpdateNotification from './components/UpdateNotification';
import routes from './constants/routes.json';
import {
  ConfigProvider,
  ModalProvider,
  NavigationProvider,
  ScrapingProvider,
} from './contexts';
import BaseLayout from './layout/Base';
import ResultsDetailsPage from './pages/admin/ResultsDetailsPage';
import ResultsPage from './pages/admin/ResultsPage';
import AdvancedScrapingPage from './pages/admin/ScrapingAdvancedPage';
import ScrapingConfigEditorPage from './pages/admin/ScrapingConfigEditorPage';
import SettingsPage from './pages/admin/SettingsPage';
import VisualizationAdvancedPage from './pages/admin/VisualizationAdvancedPage';
import VisualizationExperimentsPage from './pages/admin/VisualizationExperimentsPage';
import StartPage from './pages/StartPage';
import ytRoutes from './providers/youtube/routes';

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
                  <Route
                    path={routes.SCRAPING_ADVANCED}
                    component={AdvancedScrapingPage}
                  />
                  <Route
                    path={routes.SCRAPING_CONFIG_EDITOR}
                    component={ScrapingConfigEditorPage}
                  />
                  <Route
                    path={routes.RESULTS_DETAILS}
                    component={ResultsDetailsPage}
                  />
                  <Route path={routes.RESULTS} component={ResultsPage} />
                  <Route path={routes.SETTINGS} component={SettingsPage} />
                  <Route
                    path={routes.VISUALIZATION_ADVANCED}
                    component={VisualizationAdvancedPage}
                  />
                  <Route
                    path={routes.VISUALIZATION_EXPERIMENT}
                    component={VisualizationExperimentsPage}
                  />

                  {/*
                  Sections:
                */}
                  {Object.values(ytRoutes).map(({ path, comp }) => (
                    <Route path={path} component={comp} />
                  ))}
                  <Route path={routes.START} component={StartPage} />
                  <Route path="/">
                    <Redirect to={routes.START} />
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

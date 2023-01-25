// BrowserRouter breaks images in prod builds
import {
  MemoryRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import "./App.global.css";
import BaseLayoutSwitch from "./components/BaseLayoutSwitch";
import ScrapingAttached from "./components/scraping/ScrapingAttached";
import UpdateNotification from "./components/UpdateNotification";
import {
  ConfigProvider,
  NavigationProvider,
  ScrapingProvider,
} from "./contexts";
import { allRoutes } from "./routes";

const App = () => {
  return (
    <ConfigProvider>
      <NavigationProvider>
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
                  <Redirect to="/select_campaign" />
                </Route>
              </Switch>
            </BaseLayoutSwitch>
            {/* `ScrapingAttached` has to come _after_ the pages in the router
              but has to be a child of `Router` to navigate */}
            <ScrapingAttached />
          </Router>
        </ScrapingProvider>
      </NavigationProvider>
    </ConfigProvider>
  );
};

export default App;

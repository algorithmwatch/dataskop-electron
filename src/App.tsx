import React from 'react';
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
import { ConfigProvider } from './contexts/config';
import { ModalProvider } from './contexts/modal';
import { NavigationProvider } from './contexts/navigation';
import { ScrapingProvider } from './contexts/scraping';
import BaseLayout from './layout/Base';
import ResultsDetailsPage from './pages/admin/ResultsDetailsPage';
import ResultsPage from './pages/admin/ResultsPage';
import AdvancedScrapingPage from './pages/admin/ScrapingAdvancedPage';
import ScrapingConfigEditorPage from './pages/admin/ScrapingConfigEditorPage';
import SettingsPage from './pages/admin/SettingsPage';
import VisualizationAdvancedPage from './pages/admin/VisualizationAdvancedPage';
import VisualizationExperimentsPage from './pages/admin/VisualizationExperimentsPage';
import DonationPage1 from './pages/DonationPage1';
import DonationPage2 from './pages/DonationPage2';
import DonationSuccessPage from './pages/DonationSuccessPage';
import InterfaceTutorialPage from './pages/InterfaceTutorialPage';
import IntroductionPage from './pages/IntroductionPage';
import MyDataHintPage from './pages/MyDataHintPage';
import OnboardingPage1 from './pages/OnboardingPage1';
import OnboardingPage2 from './pages/OnboardingPage2';
import QuestionnairePage from './pages/QuestionnairePage';
import ResearchInfoPage from './pages/ResearchInfoPage';
import ScrapingExplanationPage from './pages/ScrapingExplanationPage';
import StartPage from './pages/StartPage';
import VisualizationAutoplayChainPage from './pages/VisualizationAutoplayChainPage';
import VisualizationNewsPage from './pages/VisualizationNewsPage';
import VisualizationProfilePage from './pages/VisualizationProfilePage';
import VisualizationSearchPage from './pages/VisualizationSearchPage';

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
                  <Route
                    path={routes.DONATION_SUCCESS}
                    component={DonationSuccessPage}
                  />
                  <Route path={routes.DONATION2} component={DonationPage2} />
                  <Route path={routes.DONATION1} component={DonationPage1} />
                  <Route
                    path={routes.QUESTIONNAIRE}
                    component={QuestionnairePage}
                  />
                  <Route
                    path={routes.MY_DATA_HINT}
                    component={MyDataHintPage}
                  />
                  <Route
                    path={routes.VISUALIZATION_SEARCH}
                    component={VisualizationSearchPage}
                  />
                  <Route
                    path={routes.VISUALIZATION_NEWS}
                    component={VisualizationNewsPage}
                  />
                  <Route
                    path={routes.VISUALIZATION_AUTOPLAYCHAIN}
                    component={VisualizationAutoplayChainPage}
                  />
                  <Route
                    path={routes.RESEARCH_INFO}
                    component={ResearchInfoPage}
                  />
                  <Route
                    path={routes.VISUALIZATION_PROFILE}
                    component={VisualizationProfilePage}
                  />
                  <Route
                    path={routes.SCRAPING_EXPLANATION}
                    component={ScrapingExplanationPage}
                  />
                  <Route
                    path={routes.INTERFACE_TUTORIAL}
                    component={InterfaceTutorialPage}
                  />
                  <Route
                    path={routes.ONBOARDING_2}
                    component={OnboardingPage2}
                  />
                  <Route
                    path={routes.ONBOARDING_1}
                    component={OnboardingPage1}
                  />
                  <Route
                    path={routes.INTRODUCTION}
                    component={IntroductionPage}
                  />
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

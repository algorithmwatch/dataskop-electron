import React from 'react';
// started with this guide: https://kentcdodds.com/blog/how-to-use-react-context-effectively
import routes from '../constants/routes.json';

type Action = { type: 'set-page-index'; pageIndex: number };
type Dispatch = (action: Action) => void;
type State = {
  pageIndex: number;
  pages: any[];
  sections: { [key: string]: { label: string } };
};
type NavigationProviderProps = { children: React.ReactNode };

const NavigationStateContext = React.createContext<
  | {
      state: State;
      dispatch: Dispatch;
      getNextPage: any;
      getPreviousPage: any;
      getCurrentPage: any;
      getPageIndexByPath: any;
    }
  | undefined
>(undefined);

function NavigationReducer(state: State, action: Action) {
  switch (action.type) {
    case 'set-page-index': {
      return { ...state, pageIndex: action.pageIndex };
    }
    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
}

function NavigationProvider({ children }: NavigationProviderProps) {
  // initial value gets overriden with `useEffect`
  const [state, dispatch] = React.useReducer(NavigationReducer, {
    pageIndex: 0,
    pages: [
      {
        path: routes.START,
        sectionKey: null,
      },
      {
        path: routes.INTRODUCTION,
        sectionKey: null,
      },
      {
        path: routes.ONBOARDING_1,
        sectionKey: null,
      },
      {
        path: routes.ONBOARDING_2,
        sectionKey: null,
      },
      {
        path: routes.INTERFACE_TUTORIAL,
        sectionKey: routes.INTERFACE_TUTORIAL,
      },
      {
        path: routes.SCRAPING_EXPLANATION,
        sectionKey: routes.SCRAPING_EXPLANATION,
      },
      {
        path: routes.VISUALIZATION_PROFILE,
        sectionKey: routes.VISUALIZATION_PROFILE,
      },
      {
        path: routes.RESEARCH_INFO,
        sectionKey: routes.RESEARCH_INFO,
      },
      {
        path: routes.VISUALIZATION_AUTOPLAYCHAIN,
        sectionKey: routes.VISUALIZATION_AUTOPLAYCHAIN,
      },
      {
        path: routes.VISUALIZATION_NEWS,
        sectionKey: routes.VISUALIZATION_NEWS,
      },
      {
        path: routes.VISUALIZATION_SEARCH,
        sectionKey: routes.VISUALIZATION_SEARCH,
      },
      {
        path: routes.MY_DATA,
        sectionKey: routes.MY_DATA,
      },
      {
        path: routes.QUESTIONNAIRE,
        sectionKey: routes.QUESTIONNAIRE,
      },
      {
        path: routes.DONATION1,
        sectionKey: routes.DONATION1,
      },
      {
        path: routes.DONATION2,
      },
      {
        path: routes.DONATION_SUCCESS,
        sectionKey: routes.DONATION_SUCCESS,
      },
    ],
    sections: {
      [routes.INTERFACE_TUTORIAL]: { label: 'Interface Tutorial' },
      [routes.SCRAPING_EXPLANATION]: { label: 'Was ist Scraping?' },
      [routes.VISUALIZATION_PROFILE]: { label: 'Mein YouTube-Profil' },
      [routes.RESEARCH_INFO]: { label: 'Was wir untersuchen' },
      [routes.VISUALIZATION_AUTOPLAYCHAIN]: { label: 'AutoPlay Viz' },
      [routes.VISUALIZATION_NEWS]: { label: 'News Viz' },
      [routes.VISUALIZATION_SEARCH]: { label: 'Search Viz' },
      [routes.MY_DATA]: { label: 'Meine Daten' },
      [routes.QUESTIONNAIRE]: { label: 'Umfrage' },
      [routes.DONATION1]: { label: 'Die Datenspende' },
      [routes.DONATION_SUCCESS]: { label: 'Ende' },
    },
  });

  const getNextPage = (propName?: string) => {
    const nextIndex = state.pageIndex + 1;

    if (!state.pages[nextIndex]) {
      throw new Error(`Next page index "${nextIndex}" does not exist`);
    }

    const nextPageObj = state.pages[nextIndex];

    if (propName) {
      if (!nextPageObj[propName]) {
        throw new Error(
          `Property "${propName}" does not exist on next page object`,
        );
      }
      return nextPageObj[propName];
    }

    return nextPageObj;
  };

  const getPreviousPage = (propName?: string) => {
    const prevIndex = state.pageIndex - 1;

    if (!state.pages[prevIndex]) {
      throw new Error(`Previous page index "${prevIndex}" does not exist`);
    }

    const prevPageObj = state.pages[prevIndex];

    if (propName) {
      if (!prevPageObj[propName]) {
        throw new Error(
          `Property "${propName}" does not exist on previous page object`,
        );
      }
      return prevPageObj[propName];
    }

    return prevPageObj;
  };

  const getCurrentPage = (propName?: string) => {
    const currentIndex = state.pageIndex;

    if (!state.pages[currentIndex]) {
      throw new Error(`Current page index "${currentIndex}" does not exist`);
    }

    const currentPageObj = state.pages[currentIndex];

    if (propName) {
      if (!currentPageObj[propName]) {
        throw new Error(
          `Property "${propName}" does not exist on current page object`,
        );
      }
      return currentPageObj[propName];
    }

    return currentPageObj;
  };

  const getPageIndexByPath = (path: string) =>
    state.pages.findIndex((page) => page.path === path);

  const value = {
    state,
    dispatch,
    getNextPage,
    getPreviousPage,
    getCurrentPage,
    getPageIndexByPath,
  };

  return (
    <NavigationStateContext.Provider value={value}>
      {children}
    </NavigationStateContext.Provider>
  );
}

function useNavigation() {
  const context = React.useContext(NavigationStateContext);

  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }

  return context;
}

export { NavigationProvider, useNavigation };

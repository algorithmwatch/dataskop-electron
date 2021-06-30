import React from 'react';
// started with this guide: https://kentcdodds.com/blog/how-to-use-react-context-effectively
import routes from '../constants/routes.json';

type Action = { type: 'set-page-index'; pageIndex: number };
type Dispatch = (action: Action) => void;
type State = {
  pageIndex: number;
  pages: any[];
  sections: any[];
};
type NavigationProviderProps = { children: React.ReactNode };

const NavigationStateContext = React.createContext<
  | {
      state: State;
      dispatch: Dispatch;
      getNextPage: any;
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
        sectionIndex: 0,
      },
      {
        path: routes.INTRODUCTION,
        sectionIndex: 1,
      },
      {
        path: routes.ONBOARDING_1,
        sectionIndex: 2,
      },
      {
        path: routes.ONBOARDING_2,
      },
      {
        path: routes.INTERFACE_TUTORIAL,
        sectionIndex: 3,
      },
      {
        path: routes.SCRAPING_EXPLANATION,
        sectionIndex: 4,
      },
      {
        path: routes.VISUALIZATION_PROFILE,
        sectionIndex: 5,
      },
      {
        path: routes.VISUALIZATION_AUTOPLAYCHAIN,
        sectionIndex: 6,
      },
      {
        path: routes.VISUALIZATION_NEWS,
        sectionIndex: 7,
      },
      {
        path: routes.VISUALIZATION_SEARCH,
        sectionIndex: 8,
      },
      {
        path: routes.MY_DATA_HINT,
        sectionIndex: 9,
      },
      {
        path: routes.QUESTIONNAIRE,
        sectionIndex: 10,
      },
      {
        path: routes.DONATION1,
        sectionIndex: 11,
      },
      {
        path: routes.DONATION2,
      },
      {
        path: routes.DONATION_SUCCESS,
        sectionIndex: 12,
      },
    ],
    sections: [
      { label: 'Section 1' },
      { label: 'Section 2' },
      { label: 'Section 3' },
      { label: 'Section 4' },
      { label: 'Section 5' },
      { label: 'Section 6' },
      { label: 'Section 7' },
      { label: 'Section 8' },
      { label: 'Section 9' },
      { label: 'Section 10' },
      { label: 'Section 11' },
      { label: 'Section 12' },
    ],
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

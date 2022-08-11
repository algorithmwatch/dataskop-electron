/**
 * Controls the pages in the slide-based navigation.
 *
 * @module
 */
import React from 'react';
import { providerInfo } from 'renderer/providers/info';
import { NavigationState, NavigationStatePage } from './types';

type Action =
  | { type: 'set-page-index'; pageIndex: number }
  | {
      type: 'set-navigation-by-provider';
      provider: string;
      navSlug: string;
    };
type Dispatch = (action: Action) => void;

type NavigationProviderProps = { children: React.ReactNode };

type NavigationFunctionSignature = <Prop extends keyof NavigationStatePage>(
  propName?: Prop,
) => NavigationStatePage | NavigationStatePage[Prop];

type NavigationStateContextType =
  | {
      state: NavigationState;
      dispatch: Dispatch;
      getNextPage: NavigationFunctionSignature;
      getPreviousPage: NavigationFunctionSignature;
      getCurrentPage: NavigationFunctionSignature;
      getPageIndexByPath: (path: NavigationStatePage['path']) => number;
    }
  | undefined;

const NavigationStateContext =
  React.createContext<NavigationStateContextType>(undefined);

const initialNavigationState: NavigationState = {
  pageIndex: 0,
  pages: [
    {
      path: '/select_campaign',
      sectionKey: null,
    },
  ],
  sections: {},
};

const NavigationReducer = (
  state: NavigationState,
  action: Action,
): NavigationState => {
  switch (action.type) {
    case 'set-page-index': {
      return { ...state, pageIndex: action.pageIndex };
    }
    case 'set-navigation-by-provider': {
      const navConfig =
        providerInfo[action.provider].navigation[action.navSlug];

      const basePages = initialNavigationState.pages;

      return {
        pageIndex: initialNavigationState.pages.length,
        pages: basePages.concat(navConfig.pages),
        sections: navConfig.sections,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
};

const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const [state, dispatch] = React.useReducer(
    NavigationReducer,
    initialNavigationState,
  );

  const getNextPage: NavigationFunctionSignature = (propName) => {
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

  const getPreviousPage: NavigationFunctionSignature = (propName) => {
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

  const getCurrentPage: NavigationFunctionSignature = (propName) => {
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

  const getPageIndexByPath = (path: NavigationStatePage['path']): number =>
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
};

const useNavigation = () => {
  const context = React.useContext(NavigationStateContext);

  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }

  return context;
};

export { NavigationProvider, useNavigation };

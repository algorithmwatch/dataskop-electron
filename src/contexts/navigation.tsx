import React from 'react';
// started with this guide: https://kentcdodds.com/blog/how-to-use-react-context-effectively
import routes from '../constants/routes.json';

type Action = { type: 'set-step'; step: number };
type Dispatch = (action: Action) => void;
type State = {
  step: number;
  routes: any[];
};
type NavigationProviderProps = { children: React.ReactNode };

// const sidebarMenu = [
//   {
//     label: 'Menüpunkt 1',
//     icon: faChartPieAlt,
//   },
//   {
//     label: 'Menüpunkt 2',
//     icon: faPaperPlane,
//   },
//   {
//     label: 'Menüpunkt 3',
//     icon: faInfoCircle,
//   },
// ];
// const processIndicatorSteps = [
//   {
//     label: 'Section 1',
//   },
//   {
//     label: 'Section 2',
//   },
//   {
//     label: 'Section 3',
//   },
//   {
//     label: 'Section 4',
//   },
//   {
//     label: 'Section 5',
//   },
//   {
//     label: 'Section 6',
//   },
// ];

// const routeSetting: {
//   [key: string]: {
//     stepIndex: number;
//     isDarkMode: boolean;
//   };
// } = {
//   [routes.START]: {
//     stepIndex: 0,
//     isDarkMode: false,
//   },
//   [routes.EXPLANATION]: {
//     stepIndex: 1,
//     isDarkMode: false,
//   },
//   [routes.PROVIDER_LOGIN]: {
//     stepIndex: 2,
//     isDarkMode: false,
//   },
// };

const NavigationStateContext = React.createContext<
  { state: State; dispatch: Dispatch; nextPage: any } | undefined
>(undefined);

function NavigationReducer(state: State, action: Action) {
  switch (action.type) {
    case 'set-step': {
      return { ...state, step: action.step };
    }
    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
}

function NavigationProvider({ children }: NavigationProviderProps) {
  // initial value gets overriden with `useEffect`
  const [state, dispatch] = React.useReducer(NavigationReducer, {
    step: 0,
    routes: [{ path: routes.START }, { path: routes.PROVIDER_LOGIN }],
  });

  const nextPage = () => state.routes[state.step + 1];

  const value = { state, dispatch, nextPage };

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

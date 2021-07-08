import React from 'react';

type Action = { type: 'set-modal-options'; options: { [key: string]: any } };
type Dispatch = (action: Action) => void;
type State = {
  isOpen: boolean;
  componentName: string;
  onAfterOpen: () => void;
  onClose: () => void;
};
type ModalProviderProps = { children: React.ReactNode };

const ModalStateContext = React.createContext<
  | {
      state: State;
      dispatch: Dispatch;
    }
  | undefined
>(undefined);

function ModalReducer(state: State, action: Action) {
  switch (action.type) {
    case 'set-modal-options': {
      const newState = { ...state };

      if (typeof action.options.isOpen !== 'undefined') {
        newState.isOpen = action.options.isOpen;
      }
      if (typeof action.options.componentName !== 'undefined') {
        newState.componentName = action.options.componentName;
      }
      if (typeof action.options.onAfterOpen !== 'undefined') {
        newState.onAfterOpen = action.options.onAfterOpen;
      }
      if (typeof action.options.onClose !== 'undefined') {
        newState.onClose = action.options.onClose;
      }
      return newState;
    }
    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
}

function ModalProvider({ children }: ModalProviderProps) {
  // initial value gets overriden with `useEffect`
  const [state, dispatch] = React.useReducer(ModalReducer, {
    isOpen: false,
    componentName: '',
    onAfterOpen: () => null,
    onClose: () => null,
  });

  const value = {
    state,
    dispatch,
  };

  return (
    <ModalStateContext.Provider value={value}>
      {children}
    </ModalStateContext.Provider>
  );
}

function useModal() {
  const context = React.useContext(ModalStateContext);

  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }

  return context;
}

export { ModalProvider, useModal };

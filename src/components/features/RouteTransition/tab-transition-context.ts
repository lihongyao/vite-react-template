import { createContext, useContext } from 'react';

export type TabTransitionIntent = {
  fromPath: string;
  id: number;
  toPath: string;
};

export type TabTransitionContextValue = {
  beginTabTransition: (fromPath: string, toPath: string) => void;
  completeTabTransition: (id: number) => void;
  tabHistoryIndex: number | null;
  tabTransition: TabTransitionIntent | null;
};

export const TabTransitionContext = createContext<TabTransitionContextValue | null>(null);

export function useTabRouteTransition() {
  const context = useContext(TabTransitionContext);

  if (!context) {
    throw new Error('useTabRouteTransition must be used within RouteTransitionProvider');
  }

  return context;
}

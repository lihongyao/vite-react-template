import Tips from './Tips';
import X1Dialog from './X1Dialog';
import X2Dialog from './X2Dialog';
import X3Dialog from './X3Dialog';
import type { DialogRegistry } from './types';

export type {
  DialogContextValue,
  DialogInstance,
  DialogPropsMap,
  DialogPropsUpdater,
  DialogType,
  PropsOf,
} from './types';

export const dialogRegistry = {
  Tips,
  X1Dialog,
  X2Dialog,
  X3Dialog,
} as const satisfies DialogRegistry;

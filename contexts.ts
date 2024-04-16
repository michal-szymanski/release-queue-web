import { createContext } from 'react/';
import { RootStore } from '@/stores';

export const StoreContext = createContext<InstanceType<typeof RootStore> | null>(null);

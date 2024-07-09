import { createContext } from 'react/';
import { rootStore } from '@/stores';

export const StoreContext = createContext<typeof rootStore | null>(null);

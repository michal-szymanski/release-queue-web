import { createContext } from 'react/';
import { DataStore } from '@/stores/data-store';

export const DataContext = createContext<InstanceType<typeof DataStore> | null>(null);

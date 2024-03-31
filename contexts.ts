import { createContext } from 'react/';
import { MergeRequestsStore } from '@/stores/merge-requests-store';

export const MergeRequestsContext = createContext<InstanceType<typeof MergeRequestsStore> | null>(null);

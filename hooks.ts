'use client';

import { useContext } from 'react';
import { MergeRequestsContext } from '@/contexts';
import { MergeRequestsStore } from '@/stores/merge-requests-store';

export const useMergeRequestsStore = (): MergeRequestsStore => {
    const mergeRequestsStore = useContext(MergeRequestsContext);

    if (!mergeRequestsStore) throw Error('MergeRequestsStore is not available.');

    return mergeRequestsStore;
};

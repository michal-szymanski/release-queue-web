'use client';

import { useContext } from 'react';
import { MergeRequestsContext } from '@/contexts';

export const useMergeRequestsStore = () => {
    const mergeRequestsStore = useContext(MergeRequestsContext);

    if (!mergeRequestsStore) throw Error('MergeRequestsStore is not available.');

    return mergeRequestsStore;
};

'use client';

import { useContext } from 'react';
import { MergeRequestsContext } from '@/contexts';
import { MergeRequestsStore } from '@/stores/merge-requests-store';
import { useSession } from 'next-auth/react';
import { User, userSchema } from '@/types';

export const useMergeRequestsStore = (): MergeRequestsStore => {
    const mergeRequestsStore = useContext(MergeRequestsContext);

    if (!mergeRequestsStore) throw Error('MergeRequestsStore is not available.');

    return mergeRequestsStore;
};

export const useUser = (): User | null => {
    const { data } = useSession();

    if (!data) return null;

    return userSchema.parse(data.user);
};

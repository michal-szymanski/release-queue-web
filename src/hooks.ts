'use client';

import { useContext } from 'react';
import { StoreContext } from '@/contexts';
import { useSession } from 'next-auth/react';
import { User, userSchema } from '@/types';
import { RootStore } from '@/stores';

export const useStore = (): RootStore => {
    const rootStore = useContext(StoreContext);

    if (!rootStore) throw Error('RootStore is not available.');

    return rootStore;
};

export const useUser = (): User | null => {
    const { data } = useSession();

    if (!data) return null;

    return userSchema.parse(data.user);
};

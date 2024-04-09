'use client';

import { useContext } from 'react';
import { DataContext } from '@/contexts';
import { DataStore } from '@/stores/data-store';
import { useSession } from 'next-auth/react';
import { User, userSchema } from '@/types';

export const useDataStore = (): DataStore => {
    const dataStore = useContext(DataContext);

    if (!dataStore) throw Error('DataStore is not available.');

    return dataStore;
};

export const useUser = (): User | null => {
    const { data } = useSession();

    if (!data) return null;

    return userSchema.parse(data.user);
};

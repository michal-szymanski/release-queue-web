'use client';

import { useContext } from 'react';
import { StoreContext } from '@/contexts';
// import { useSession } from 'next-auth/react';
import { User, userSchema } from '@/types';
import { rootStore } from '@/stores';

export const useStore = (): typeof rootStore => {
    const store = useContext(StoreContext);

    if (!store) throw Error('RootStore is not available.');

    return store;
};

export const useUser = (): User | null => {
    // const { data } = useSession();

    // if (!data) return null;

    return userSchema.parse({
        id: 1,
        name: '',
        email: '',
        image: ''
    });
};

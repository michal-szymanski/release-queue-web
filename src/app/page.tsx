'use client';

import { StoreContext } from '@/contexts';
import MergeRequests from '@/components/merge-requests';
import Queue from '@/components/queue';
import { SessionProvider } from 'next-auth/react';
import { RootStore } from '@/stores';
import { useState } from 'react';

const Page = () => {
    const [store] = useState(() => new RootStore());

    return (
        <SessionProvider>
            <StoreContext.Provider value={store}>
                <div className="grid h-full w-full grid-cols-2 gap-5 py-10">
                    <Queue />
                    <MergeRequests />
                </div>
            </StoreContext.Provider>
        </SessionProvider>
    );
};

export default Page;

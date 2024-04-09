'use client';

import { DataStore } from '@/stores/data-store';
import { DataContext } from '@/contexts';
import MergeRequests from '@/components/merge-requests';
import Queue from '@/components/queue';
import { SessionProvider } from 'next-auth/react';

const Page = () => {
    return (
        <SessionProvider>
            <DataContext.Provider value={new DataStore()}>
                <div className="grid h-full w-full grid-cols-2 gap-5 py-10">
                    <Queue />
                    <MergeRequests />
                </div>
            </DataContext.Provider>
        </SessionProvider>
    );
};

export default Page;

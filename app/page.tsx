'use client';

import { MergeRequestsStore } from '@/stores/merge-requests-store';
import { MergeRequestsContext } from '@/contexts';
import MergeRequests from '@/components/merge-requests';
import Queue from '@/components/queue';
import { SessionProvider } from 'next-auth/react';

const Page = () => {
    return (
        <SessionProvider>
            <MergeRequestsContext.Provider value={new MergeRequestsStore()}>
                <div className="grid h-full w-full grid-cols-2 gap-5 py-10">
                    <Queue />
                    <MergeRequests />
                </div>
            </MergeRequestsContext.Provider>
        </SessionProvider>
    );
};

export default Page;

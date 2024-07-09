'use client';

import { StoreContext } from '@/contexts';
import MergeRequests from '@/components/merge-requests';
import Queue from '@/components/queue';
import { rootStore } from '@/stores';

const Page = () => {
    return (
        <StoreContext.Provider value={rootStore}>
            <div className="grid h-full w-full grid-cols-2 gap-5 py-10">
                <Queue />
                <MergeRequests />
            </div>
        </StoreContext.Provider>
    );
};

export default Page;

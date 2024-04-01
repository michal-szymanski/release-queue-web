'use client';

import { MergeRequestsStore } from '@/stores/merge-requests-store';
import { MergeRequestsContext } from '@/contexts';
import MergeRequests from '@/components/merge-requests';
import Queue from '@/components/queue';

const Page = () => {
    return (
        <MergeRequestsContext.Provider value={new MergeRequestsStore()}>
            <div className="grid w-full grid-cols-2 grid-rows-1 gap-5 py-10">
                <Queue />
                <MergeRequests />
            </div>
        </MergeRequestsContext.Provider>
    );
};

export default Page;

'use client';

import Queue from '@/components/queue';
import { MergeRequestsStore } from '@/stores/merge-requests-store';
import { MergeRequestsContext } from '@/contexts';
import OpenMergeRequests from '@/components/open-merge-requests';

const Page = () => {
    return (
        <MergeRequestsContext.Provider value={new MergeRequestsStore()}>
            <div className="grid grid-cols-2 gap-5">
                <Queue />
                <OpenMergeRequests />
            </div>
        </MergeRequestsContext.Provider>
    );
};

export default Page;

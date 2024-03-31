'use client';

import Queue from '@/components/queue';
import { MergeRequestsStore } from '@/stores/merge-requests-store';
import { MergeRequestsContext } from '@/contexts';

const Page = () => {
    return (
        <div>
            <MergeRequestsContext.Provider value={new MergeRequestsStore()}>
                <Queue />
            </MergeRequestsContext.Provider>
        </div>
    );
};

export default Page;

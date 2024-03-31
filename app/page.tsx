'use client';

import Queue from '@/components/queue';
import { MergeRequestsStore } from '@/stores/merge-requests-store';
import { MergeRequestsContext } from '@/contexts';
import OpenMergeRequests from '@/components/open-merge-requests';
import { ThemeDropdown } from '@/components/theme-dropdown';

const Page = () => {
    return (
        <div>
            <MergeRequestsContext.Provider value={new MergeRequestsStore()}>
                <div className="grid grid-cols-2 gap-5">
                    <Queue />
                    <OpenMergeRequests />
                </div>
                <ThemeDropdown />
            </MergeRequestsContext.Provider>
        </div>
    );
};

export default Page;

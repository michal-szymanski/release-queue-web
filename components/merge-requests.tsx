import MergeRequestList from '@/components/merge-request-list';
import { useStore } from '@/hooks';
import { observer } from 'mobx-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const MergeRequests = () => {
    const {
        dataStore: { mergeRequestEvents }
    } = useStore();
    return (
        <div className="h-full overflow-hidden rounded-[0.5rem] border bg-background shadow-md md:shadow-xl">
            <div className="flex h-full flex-1 flex-col space-y-8 p-8">
                <div className="grid h-full flex-grow grid-rows-[auto,1fr] gap-5 overflow-hidden">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Merge requests</h2>
                        <p className="text-muted-foreground">All of your open merge requests ready to queue.</p>
                    </div>
                    <ScrollArea className="h-full pr-5">
                        <MergeRequestList data={mergeRequestEvents} isQueue={false} />
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};

export default observer(MergeRequests);

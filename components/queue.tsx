import { ScrollArea } from '@/components/ui/scroll-area';
import QueueTabs from '@/components/queue-tabs';
import QueueItemList from '@/components/queue-item-list';

const Queue = () => {
    return (
        <div className="h-full overflow-hidden rounded-[0.5rem] bg-background">
            <div className="flex h-full flex-1 flex-col space-y-8 p-8">
                <div className="flex h-full flex-col gap-5">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Queue</h2>
                    </div>
                    <QueueTabs />
                    <div className="flex flex-grow flex-col gap-5 overflow-hidden">
                        <ScrollArea className="h-full pr-5">
                            <QueueItemList />
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Queue;

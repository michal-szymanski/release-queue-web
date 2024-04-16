import { useStore } from '@/hooks';
import { observer } from 'mobx-react';
import MergeRequestList from '@/components/merge-request-list';
import dayjs from 'dayjs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import QueueTabs from '@/components/queue-tabs';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const Queue = () => {
    const {
        dataStore: { queueMap },
        uiStore: { activeRepository }
    } = useStore();
    const [parent] = useAutoAnimate();

    const renderContent = () => {
        const queue = activeRepository ? (queueMap.get(activeRepository) ?? []).map(({ json, date }) => ({ json, date })) : [];
        const groups = Object.groupBy(queue, ({ date }) => date);
        const today = new Date();

        return (
            <ScrollArea className="h-full pr-5">
                <div ref={parent} className="flex flex-col gap-12">
                    {Object.keys(groups).map((date) => (
                        <div key={`${date}:${activeRepository}`} className="flex flex-col gap-10">
                            {dayjs(date).isAfter(today) && (
                                <div className="flex flex-col gap-1 pl-2">
                                    <div className="text-2xl font-bold">{dayjs(date).format('dddd')}</div>
                                    <Separator className="w-48" />
                                    <div className="text-sm text-muted-foreground">{dayjs(date).format('DD-MM-YYYY')}</div>
                                </div>
                            )}
                            <MergeRequestList data={(groups[date] ?? []).map(({ json }) => json)} isQueue={true} />
                        </div>
                    ))}
                </div>
            </ScrollArea>
        );
    };

    return (
        <div className="h-full overflow-hidden rounded-[0.5rem] bg-background">
            <div className="flex h-full flex-1 flex-col space-y-8 p-8">
                <div className="flex h-full flex-col gap-5">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Queue</h2>
                    </div>
                    <QueueTabs />
                    <div className="flex flex-grow flex-col gap-5 overflow-hidden">{renderContent()}</div>
                </div>
            </div>
        </div>
    );
};

export default observer(Queue);

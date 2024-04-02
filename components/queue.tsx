import QueueItems from '@/components/queue-items';
import { useMergeRequestsStore } from '@/hooks';
import { observer } from 'mobx-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Queue = () => {
    const { queueMap } = useMergeRequestsStore();
    const [parentWrapper] = useAutoAnimate();
    const [parentTabs] = useAutoAnimate();
    const [activeRepository, setActiveRepository] = useState('');

    useEffect(() => {
        const keys = Array.from(queueMap.keys());

        if (!keys.length) return;

        const firstRepository = keys[0];

        if (!activeRepository || !queueMap.get(activeRepository)) {
            setActiveRepository(firstRepository);
        }
    }, [activeRepository, queueMap]);

    const renderTabs = () => {
        const keys = Array.from(queueMap.keys());

        if (!keys.length) return null;

        return (
            <div className="pb-5">
                <div ref={parentTabs} className="h-9 w-fit items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                    {keys.map((key) => (
                        <Button
                            key={key}
                            className={cn(
                                'inline-flex h-auto items-center justify-center whitespace-nowrap rounded-md bg-transparent px-3 py-1 text-sm font-medium text-zinc-600 ring-offset-background transition-all hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:text-zinc-200',
                                {
                                    'bg-background text-foreground shadow-sm hover:bg-background': key === activeRepository
                                }
                            )}
                            onClick={() => setActiveRepository(key)}
                        >
                            {key}
                        </Button>
                    ))}
                </div>
            </div>
        );
    };
    const renderContent = () => {
        const queue = queueMap.get(activeRepository);

        if (!queue) return null;

        return <QueueItems queue={queue} />;
    };

    return (
        <div className="overflow-hidden rounded-[0.5rem] bg-background">
            <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
                <div className="flex flex-col gap-5">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Queue</h2>
                    </div>
                    <div ref={parentWrapper}>
                        {renderTabs()}
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default observer(Queue);

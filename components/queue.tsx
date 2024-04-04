import { useMergeRequestsStore } from '@/hooks';
import { observer } from 'mobx-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { clsx } from 'clsx';
import MergeRequestList from '@/components/merge-request-list';

const Queue = () => {
    const { queueMap, queueKeys } = useMergeRequestsStore();
    const [parent] = useAutoAnimate();
    const [activeRepository, setActiveRepository] = useState('');

    useEffect(() => {
        if (!queueKeys.length) return;

        const firstRepository = queueKeys[0];

        if (!activeRepository || !queueMap.get(activeRepository)) {
            setActiveRepository(firstRepository);
        }
    }, [activeRepository, queueMap, queueKeys]);

    const renderTabs = () => {
        return (
            <div className="h-9">
                <div
                    className={clsx('inline-block h-full rounded-lg bg-muted p-1 text-muted-foreground opacity-0 transition-opacity', {
                        'opacity-100': queueKeys.length > 0
                    })}
                >
                    <div ref={parent}>
                        {queueKeys.map((key) => (
                            <div key={key} className="inline-block">
                                <Button
                                    className={cn(
                                        'h-auto items-center justify-center whitespace-nowrap rounded-md bg-transparent px-3 py-1 text-sm font-medium text-zinc-600 ring-offset-background transition-all hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:text-zinc-200',
                                        {
                                            'bg-background text-foreground shadow-sm hover:bg-background': key === activeRepository
                                        }
                                    )}
                                    onClick={() => setActiveRepository(key)}
                                >
                                    {key}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };
    const renderContent = () => {
        const queue = (queueMap.get(activeRepository) ?? []).map((queueItem) => queueItem.json);

        return <MergeRequestList data={queue} isQueue={true} />;
    };

    return (
        <div className="h-full overflow-hidden rounded-[0.5rem] bg-background">
            <div className="flex h-full flex-1 flex-col space-y-8 p-8">
                <div className="flex h-full flex-col gap-5">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Queue</h2>
                    </div>
                    {renderTabs()}
                    <div className="flex-grow overflow-hidden">{renderContent()}</div>
                </div>
            </div>
        </div>
    );
};

export default observer(Queue);

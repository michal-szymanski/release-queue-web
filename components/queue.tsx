import QueueItems from '@/components/queue-items';
import { useMergeRequestsStore } from '@/hooks';
import { observer } from 'mobx-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const Queue = () => {
    const { queueMap } = useMergeRequestsStore();
    const [parent] = useAutoAnimate();
    return (
        <div className="overflow-hidden rounded-[0.5rem] bg-background">
            <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
                <div className="flex flex-col gap-5" ref={parent}>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Queue</h2>
                    </div>
                    {Array.from(queueMap.keys()).map((repositoryName) => (
                        <span key={repositoryName}>{repositoryName}</span>
                    ))}
                    {Array.from(queueMap.entries()).map(([repositoryName, queue]) => (
                        <QueueItems key={repositoryName} queue={queue} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default observer(Queue);

import QueueItem from '@/components/merge-request';
import { observer } from 'mobx-react';
import { useMergeRequestsStore } from '@/hooks';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const Queue = () => {
    const { queue } = useMergeRequestsStore();
    const [parent] = useAutoAnimate();

    return (
        <div>
            <h2>Queue</h2>
            <div ref={parent} className="flex flex-col gap-2">
                {queue.map((queueItem) => (
                    <QueueItem key={queueItem.object_attributes.id} event={queueItem} isQueueItem={true} />
                ))}
            </div>
        </div>
    );
};
export default observer(Queue);

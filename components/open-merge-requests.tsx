import QueueItem from '@/components/queue-item';
import { observer } from 'mobx-react';
import { useMergeRequestsStore } from '@/hooks';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const OpenMergeRequests = () => {
    const { mergeRequestEvents, queue } = useMergeRequestsStore();
    const [parent] = useAutoAnimate();

    return (
        <div>
            <h2>My merge requests</h2>
            <div ref={parent} className="flex flex-col gap-2">
                {mergeRequestEvents
                    .filter((event) => !queue.some((queueItem) => queueItem.object_attributes.id === event.object_attributes.id))
                    .map((event) => (
                        <QueueItem key={event.object_attributes.id} event={event} />
                    ))}
            </div>
        </div>
    );
};
export default observer(OpenMergeRequests);

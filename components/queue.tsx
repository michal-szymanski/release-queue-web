import QueueItem from '@/components/queue-item';
import { observer } from 'mobx-react';
import { useMergeRequestsStore } from '@/hooks';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const Queue = () => {
    const { mergeRequestEvents } = useMergeRequestsStore();
    const [parent] = useAutoAnimate();

    return (
        <div ref={parent} className="flex flex-col gap-2">
            {mergeRequestEvents.map((event) => (
                <QueueItem key={event.object_attributes.id} event={event} />
            ))}
        </div>
    );
};
export default observer(Queue);

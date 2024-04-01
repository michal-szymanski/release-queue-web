import MergeRequest from '@/components/merge-request';
import { observer } from 'mobx-react';
import { useMergeRequestsStore } from '@/hooks';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const OpenMergeRequests = () => {
    const { mergeRequestEvents, queue } = useMergeRequestsStore();
    const [parent] = useAutoAnimate();

    return (
        <div ref={parent} className="flex flex-col gap-2">
            {mergeRequestEvents.map((event) => (
                <MergeRequest key={event.object_attributes.id} event={event} isQueueItem={false} />
            ))}
        </div>
    );
};
export default observer(OpenMergeRequests);

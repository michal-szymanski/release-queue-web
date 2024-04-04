import MergeRequest from '@/components/merge-request';
import { observer } from 'mobx-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { MergeRequestEvent } from '@/types';

type Props = {
    queue: { id: number; json: MergeRequestEvent }[];
};

const QueueItems = ({ queue }: Props) => {
    const [parent] = useAutoAnimate();

    return (
        <div ref={parent} className="flex flex-col gap-2 py-1">
            {queue.map((queueItem) => (
                <MergeRequest key={queueItem.id} event={queueItem.json} isQueueItem={true} />
            ))}
        </div>
    );
};
export default observer(QueueItems);

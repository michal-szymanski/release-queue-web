import QueueItem from '@/components/merge-request';
import { observer } from 'mobx-react';
import { useMergeRequestsStore } from '@/hooks';
import { useAutoAnimate } from '@formkit/auto-animate/react';

type Props = {
    repositoryName: string;
};

const QueueItems = ({ repositoryName }: Props) => {
    const { queue } = useMergeRequestsStore();
    const [parent] = useAutoAnimate();

    return (
        <div ref={parent} className="flex flex-col gap-2">
            {queue
                .filter((queueItem) => queueItem.repository.name === repositoryName)
                .map((queueItem) => (
                    <QueueItem key={queueItem.object_attributes.id} event={queueItem} isQueueItem={true} />
                ))}
        </div>
    );
};
export default observer(QueueItems);

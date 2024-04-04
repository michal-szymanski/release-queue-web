import MergeRequest from '@/components/merge-request';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { MergeRequestEvent } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

type Props = {
    data: MergeRequestEvent[];
    isQueue: boolean;
};

const MergeRequestList = ({ data, isQueue }: Props) => {
    const [parent] = useAutoAnimate();

    return (
        <ScrollArea className="h-full pr-5">
            <div ref={parent} className="flex flex-col gap-2 py-1">
                {data.map((event) => (
                    <MergeRequest key={event.object_attributes.id} event={event} isQueueItem={isQueue} />
                ))}
            </div>
        </ScrollArea>
    );
};
export default MergeRequestList;

import MergeRequest from '@/components/merge-request';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { MergeRequestEvent } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/hooks';

type Props = {
    data: MergeRequestEvent[];
    isQueue: boolean;
};

const MergeRequestList = ({ data, isQueue }: Props) => {
    const [parent] = useAutoAnimate();
    const user = useUser();

    return (
        <ScrollArea className="h-full pr-5">
            <div ref={parent} className="flex flex-col gap-2 py-1">
                {data.map((event) => (
                    <MergeRequest
                        key={event.object_attributes.id}
                        event={event}
                        isQueueItem={isQueue}
                        isUserAuthor={user !== null && user.id === event.user.id}
                    />
                ))}
            </div>
        </ScrollArea>
    );
};
export default MergeRequestList;

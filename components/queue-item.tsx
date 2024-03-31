import { MergeRequestEvent } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { AvatarFallback } from '@radix-ui/react-avatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { observer } from 'mobx-react';
import { useMergeRequestsStore } from '@/hooks';
import { Button } from '@/components/ui/button';
dayjs.extend(relativeTime);

type Props = {
    event: MergeRequestEvent;
};

const QueueItem = ({ event }: Props) => {
    const { queue, addToQueue, removeFromQueue } = useMergeRequestsStore();
    const isInQueue = queue.some((queueItem) => queueItem.object_attributes.id === event.object_attributes.id);
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-end gap-2">
                            <a href={event.object_attributes.url}>{event.object_attributes.title}</a>
                            <Badge className="capitalize">{event.object_attributes.state}</Badge>
                        </div>
                        <CardDescription>Last update: {dayjs(event.object_attributes.updated_at).fromNow()}</CardDescription>
                    </div>
                    {!isInQueue && (
                        <Button type="button" onClick={() => addToQueue(event)}>
                            Add to queue
                        </Button>
                    )}
                    {isInQueue && (
                        <Button type="button" onClick={() => removeFromQueue(event)}>
                            Remove from queue
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <Avatar className="size-6">
                        <AvatarImage src={event.user.avatar_url} />
                        <AvatarFallback>
                            <Skeleton className="size-6 rounded-full" />
                        </AvatarFallback>
                    </Avatar>
                    <span>{event.user.name}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default observer(QueueItem);

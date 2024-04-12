import { MergeRequestEvent } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { AvatarFallback } from '@radix-ui/react-avatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { observer } from 'mobx-react';
import { useDataStore } from '@/hooks';
import { Button } from '@/components/ui/button';
import { ArrowDown, Minus, Plus } from 'lucide-react';
import PipelineDetails from '@/components/pipeline-details';
dayjs.extend(relativeTime);

type Props = {
    event: MergeRequestEvent;
    isQueueItem: boolean;
    isUserAuthor: boolean;
    isPipelineVisible: boolean;
    canStepBack: boolean;
};

const MergeRequest = ({ event, isQueueItem, isUserAuthor, isPipelineVisible, canStepBack }: Props) => {
    const { addToQueue, removeFromQueue, stepBackInQueue } = useDataStore();

    const renderButton = () => {
        if (!isUserAuthor) return null;

        if (isQueueItem) {
            return (
                <>
                    {canStepBack && (
                        <Button type="button" size="icon" variant="outline" className="size-8" onClick={() => stepBackInQueue(event)}>
                            <ArrowDown className="size-5" />
                            <span className="sr-only">Step back in queue</span>
                        </Button>
                    )}
                    <Button type="button" size="icon" variant="outline" className="size-8" onClick={() => removeFromQueue(event)}>
                        <Minus className="size-5" />
                        <span className="sr-only">Remove from queue</span>
                    </Button>
                </>
            );
        }

        return (
            <Button type="button" size="icon" variant="outline" className="size-8" onClick={() => addToQueue(event, new Date().toISOString())}>
                <Plus className="size-5" />
                <span className="sr-only">Add to queue</span>
            </Button>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-end gap-2">
                            <a href={event.object_attributes.url} target="_blank" rel="noopener noreferrer">
                                {event.object_attributes.title} ({event.object_attributes.id})
                            </a>
                            {isQueueItem && <Badge className="capitalize">{event.object_attributes.state}</Badge>}
                        </div>
                        {!isQueueItem && <CardDescription>{event.repository.name}</CardDescription>}
                        <CardDescription>Last update: {dayjs(event.object_attributes.updated_at).fromNow()}</CardDescription>
                        {isPipelineVisible && <PipelineDetails event={event} />}
                    </div>
                    <div className="flex gap-2">{renderButton()}</div>
                </CardTitle>
            </CardHeader>
            {isQueueItem && (
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
            )}
        </Card>
    );
};

export default observer(MergeRequest);

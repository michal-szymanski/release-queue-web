import { MergeRequestEvent } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { AvatarFallback } from '@radix-ui/react-avatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Skeleton } from '@/components/ui/skeleton';
import { observer } from 'mobx-react';
import { useStore } from '@/hooks';
import { Button } from '@/components/ui/button';
import { ArrowDown, CircleAlert, Minus, Plus } from 'lucide-react';
import PipelineDetails from '@/components/pipeline-details';
import DatePicker from '@/components/date-picker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { variants } from '@/lib/framer-motion';
import MergeRequestBadge from '@/components/merge-request-badge';
import { EventStore } from '@/stores/event-store';

dayjs.extend(relativeTime);

type Props = {
    model: EventStore;
    isQueueItem: boolean;
    isUserAuthor: boolean;
    isPipelineVisible: boolean;
    canStepBack: boolean;
};

const MergeRequest = ({ model, isQueueItem, isUserAuthor, isPipelineVisible, canStepBack }: Props) => {
    const {
        dataStore: { addToQueue, removeFromQueue, stepBackInQueue }
    } = useStore();

    const hasConflict = model.metadata?.detailed_merge_status === 'conflict';
    const needRebase = model.metadata?.detailed_merge_status === 'need_rebase';

    const renderButton = () => {
        if (!isUserAuthor) return null;

        if (isQueueItem) {
            return (
                <>
                    {needRebase && !model.isRebasing && (
                        <Button type="button" size="sm" variant="outline" className="h-8" onClick={() => model.rebase()}>
                            Rebase
                        </Button>
                    )}
                    {canStepBack && (
                        <Button type="button" size="icon" variant="outline" className="size-8" onClick={() => stepBackInQueue(model.mergeRequest)}>
                            <ArrowDown className="size-5" />
                            <span className="sr-only">Step back in queue</span>
                        </Button>
                    )}
                    <Button type="button" size="icon" variant="outline" className="size-8" onClick={() => removeFromQueue(model)}>
                        <Minus className="size-5" />
                        <span className="sr-only">Remove from queue</span>
                    </Button>
                </>
            );
        }

        return (
            <>
                <DatePicker event={model.mergeRequest} />
                <Button type="button" size="icon" variant="outline" className="size-8" onClick={() => addToQueue(model.mergeRequest, new Date().toISOString())}>
                    <Plus className="size-5" />
                    <span className="sr-only">Add to queue</span>
                </Button>
            </>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-end gap-2">
                            <a href={model.mergeRequest.object_attributes.url} target="_blank" rel="noopener noreferrer">
                                {model.mergeRequest.object_attributes.title}
                            </a>
                            {isQueueItem && <MergeRequestBadge state={model.mergeRequest.object_attributes.state} />}
                            <AnimatePresence>
                                {isQueueItem && hasConflict && (
                                    <motion.div
                                        variants={variants}
                                        initial={['hidden', 'size-small']}
                                        animate={['visible', 'size-normal']}
                                        exit={['hidden', 'size-small']}
                                    >
                                        <TooltipProvider delayDuration={0} disableHoverableContent>
                                            <Tooltip>
                                                <TooltipTrigger className="cursor-pointer" asChild>
                                                    <CircleAlert className="text-red-500" />
                                                </TooltipTrigger>
                                                <TooltipContent className="pointer-events-none">Merge conflicts</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {!isQueueItem && <CardDescription>{model.mergeRequest.repository.name}</CardDescription>}
                        <CardDescription>Last update: {dayjs(model.mergeRequest.object_attributes.updated_at).fromNow()}</CardDescription>
                    </div>
                    <div className="flex gap-2">{renderButton()}</div>
                </CardTitle>
            </CardHeader>

            {isPipelineVisible && (
                <CardContent className="flex flex-col gap-2">
                    <PipelineDetails model={model} />
                </CardContent>
            )}

            {isQueueItem && (
                <CardFooter>
                    <div className="flex gap-2">
                        <Avatar className="size-6">
                            <AvatarImage src={model.mergeRequest.user.avatar_url} />
                            <AvatarFallback>
                                <Skeleton className="size-6 rounded-full" />
                            </AvatarFallback>
                        </Avatar>
                        <span>{model.mergeRequest.user.name}</span>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
};

export default observer(MergeRequest);

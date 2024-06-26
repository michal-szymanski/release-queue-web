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
import { EventModel } from '@/models/event-model';

dayjs.extend(relativeTime);

type Props = {
    model: EventModel;
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

    const renderButtons = () => {
        if (!isUserAuthor) return null;

        if (isQueueItem) {
            return (
                <Button type="button" size="icon" variant="outline" className="size-8" onClick={() => removeFromQueue(model)}>
                    <Minus className="size-5" />
                    <span className="sr-only">Remove from queue</span>
                </Button>
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
        <Card className="w-[500px]">
            <CardHeader className="w-full">
                <CardTitle className="flex w-full items-start justify-between">
                    <div className="flex w-full flex-col gap-2">
                        <div className="flex w-full items-center justify-between">
                            <a href={model.mergeRequest.object_attributes.url} target="_blank" rel="noopener noreferrer" className="max-w-full truncate">
                                {model.mergeRequest.object_attributes.title}
                            </a>
                            <div className="flex gap-2 pl-2">{renderButtons()}</div>
                        </div>
                        {!isQueueItem && <CardDescription>{model.mergeRequest.repository.name}</CardDescription>}
                        <div className="flex items-center gap-5">
                            {isQueueItem && <MergeRequestBadge state={model.mergeRequest.object_attributes.state} />}
                            <AnimatePresence>
                                {isQueueItem && hasConflict && (
                                    <motion.div
                                        key="merge-conflicts"
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
                                {needRebase && !model.isRebasing && (
                                    <motion.div
                                        key="rebase-button"
                                        variants={variants}
                                        initial={['hidden', 'size-small']}
                                        animate={['visible', 'size-normal']}
                                        exit={['hidden', 'size-small']}
                                        className="flex items-center"
                                    >
                                        <Button type="button" size="sm" variant="default" className="h-6" onClick={() => model.rebase()}>
                                            Rebase
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <CardDescription>Last update: {dayjs(model.mergeRequest.object_attributes.updated_at).fromNow()}</CardDescription>
                    </div>
                </CardTitle>
            </CardHeader>

            {isPipelineVisible && (
                <CardContent className="flex flex-col gap-2">
                    <PipelineDetails model={model} />
                </CardContent>
            )}

            {isQueueItem && (
                <CardFooter className="h-14 justify-between">
                    <div className="flex gap-2">
                        <Avatar className="size-6">
                            <AvatarImage src={model.mergeRequest.user.avatar_url} />
                            <AvatarFallback>
                                <Skeleton className="size-6 rounded-full" />
                            </AvatarFallback>
                        </Avatar>
                        <span>{model.mergeRequest.user.name}</span>
                    </div>
                    <AnimatePresence>
                        {canStepBack && (
                            <motion.div
                                key="step-back-button"
                                variants={variants}
                                initial={['hidden', 'size-small']}
                                animate={['visible', 'size-normal']}
                                exit={['hidden', 'size-small']}
                            >
                                <Button type="button" size="icon" variant="outline" className="size-8" onClick={() => stepBackInQueue(model)}>
                                    <ArrowDown className="size-5" />
                                    <span className="sr-only">Step back in queue</span>
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardFooter>
            )}
        </Card>
    );
};

export default observer(MergeRequest);

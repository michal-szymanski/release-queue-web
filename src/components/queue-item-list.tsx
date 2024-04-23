import MergeRequest from '@/components/merge-request';
import { useStore, useUser } from '@/hooks';
import { observer } from 'mobx-react';
import dayjs from 'dayjs';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { variants } from '@/lib/framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { groupBy } from '@/lib/utils';

const QueueItemList = () => {
    const user = useUser();
    const {
        dataStore: { queueMap, isQueueEmpty },
        uiStore: { activeRepository }
    } = useStore();

    const queue = activeRepository ? (queueMap.get(activeRepository) ?? []).map(({ json, date, rebaseError }) => ({ json, date, rebaseError })) : [];
    const groups = groupBy(queue, ({ date }) => date);
    const today = new Date();

    const renderSeparator = (date: string) => {
        if (!dayjs(date).isAfter(today)) return null;

        return (
            <motion.div key={`${date}:separator`} className="flex h-20 w-fit flex-col justify-center gap-1 pb-5 pl-2" layout="position">
                <div className="text-2xl font-bold">{dayjs(date).format('dddd')}</div>
                <Separator />
                <div className="text-sm text-muted-foreground">{dayjs(date).format('DD-MM-YYYY')}</div>
            </motion.div>
        );
    };

    const renderQueueItems = (date: string) => {
        const events = (groups[date] ?? []).map(({ json, rebaseError }) => ({ json, rebaseError }));
        return (
            <div className="flex flex-col gap-2 py-1">
                <AnimatePresence mode="popLayout">
                    {events.map(({ json: event, rebaseError }, i) => {
                        const isUserAuthor = user !== null && user.id === event.user.id;
                        const isPipelineVisible = isUserAuthor || i === 0;
                        const canStepBack = events.length > 1 && i !== events.length - 1;

                        return (
                            <motion.div
                                key={event.object_attributes.iid}
                                layout="position"
                                variants={variants}
                                initial={['hidden', 'size-small']}
                                animate={['visible', 'size-normal']}
                                exit={['hidden', 'size-small']}
                            >
                                <MergeRequest
                                    event={event}
                                    isQueueItem={true}
                                    isUserAuthor={isUserAuthor}
                                    isPipelineVisible={isPipelineVisible}
                                    canStepBack={canStepBack}
                                    rebaseError={rebaseError}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <AnimatePresence mode="popLayout">
            {isQueueEmpty && (
                <motion.div
                    key="empty-queue-message"
                    variants={variants}
                    initial={['hidden', 'size-small']}
                    animate={['visible', 'size-normal']}
                    exit={['hidden', 'size-small']}
                    className="flex w-full justify-center"
                >
                    <div className="text-lg font-bold">Queue is empty</div>
                </motion.div>
            )}
            {!isQueueEmpty && (
                <motion.div key="queue-items" variants={variants} initial="hidden" animate="visible" exit="hidden" className="h-full">
                    <ScrollArea className="h-full pr-5">
                        <div className="flex h-full flex-col gap-5">
                            <AnimatePresence mode="popLayout">
                                {Object.keys(groups).map((date) => (
                                    <motion.div key={date} layout="position" variants={variants} initial="hidden" animate="visible" exit="hidden">
                                        {renderSeparator(date)}
                                        {renderQueueItems(date)}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default observer(QueueItemList);

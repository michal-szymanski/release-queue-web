import MergeRequest from '@/components/merge-request';
import { useStore, useUser } from '@/hooks';
import { observer } from 'mobx-react';
import dayjs from 'dayjs';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { variants } from '@/lib/framer-motion';

const QueueItemList = () => {
    const user = useUser();
    const {
        dataStore: { queueMap },
        uiStore: { activeRepository }
    } = useStore();

    const queue = activeRepository ? (queueMap.get(activeRepository) ?? []).map(({ json, date }) => ({ json, date })) : [];
    const groups = Object.groupBy(queue, ({ date }) => date);
    const today = new Date();

    const renderSeparator = (date: string) => {
        if (!dayjs(date).isAfter(today)) return null;

        return (
            <motion.div className="flex h-20 w-fit flex-col justify-center gap-1 pb-5 pl-2" layout="position">
                <div className="text-2xl font-bold">{dayjs(date).format('dddd')}</div>
                <Separator />
                <div className="text-sm text-muted-foreground">{dayjs(date).format('DD-MM-YYYY')}</div>
            </motion.div>
        );
    };

    const renderQueueItems = (date: string) => {
        const events = (groups[date] ?? []).map(({ json }) => json);
        return (
            <div className="flex flex-col gap-2 py-1">
                <AnimatePresence mode="popLayout">
                    {events.map((event, i) => {
                        const isUserAuthor = user !== null && user.id === event.user.id;
                        const isPipelineVisible = isUserAuthor || i === 0;
                        const canStepBack = events.length > 1 && i !== events.length - 1;

                        return (
                            <motion.div
                                key={event.object_attributes.id}
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
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        );
    };

    return (
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
    );
};

export default observer(QueueItemList);

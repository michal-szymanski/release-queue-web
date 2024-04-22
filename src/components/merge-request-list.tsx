import MergeRequest from '@/components/merge-request';
import { MergeRequestEvent } from '@/types';
import { useUser } from '@/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { variants } from '@/lib/framer-motion';

type Props = {
    data: MergeRequestEvent[];
    isQueue: boolean;
};

const MergeRequestList = ({ data, isQueue }: Props) => {
    const user = useUser();

    return (
        <div className="flex flex-col gap-2 py-1">
            <AnimatePresence mode="popLayout">
                {data.map((event, i) => {
                    const isUserAuthor = user !== null && user.id === event.user.id;
                    const isPipelineVisible = isUserAuthor || (isQueue && i === 0);
                    const canStepBack = isQueue && data.length > 1 && i !== data.length - 1;
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
                                isQueueItem={isQueue}
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
export default MergeRequestList;

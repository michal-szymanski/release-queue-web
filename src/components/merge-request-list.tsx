import MergeRequest from '@/components/merge-request';
import { MergeRequestEvent } from '@/types';
import { useStore, useUser } from '@/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { variants } from '@/lib/framer-motion';
import { EventStore } from '@/stores/event-store';
import { observer } from 'mobx-react';

const MergeRequestList = () => {
    const {
        dataStore: { getMergeRequestsByUserId: userMergeRequests }
    } = useStore();
    const user = useUser();

    if (!user) return null;

    const models = userMergeRequests(user.id);
    return (
        <div className="flex flex-col gap-2 py-1">
            <AnimatePresence mode="popLayout">
                {models.map((model, i) => {
                    const isUserAuthor = user.id === model.mergeRequest.user.id;

                    return (
                        <motion.div
                            key={model.mergeRequest.object_attributes.iid}
                            layout="position"
                            variants={variants}
                            initial={['hidden', 'size-small']}
                            animate={['visible', 'size-normal']}
                            exit={['hidden', 'size-small']}
                        >
                            <MergeRequest model={model} isQueueItem={false} isUserAuthor={true} isPipelineVisible={true} canStepBack={false} />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};
export default observer(MergeRequestList);

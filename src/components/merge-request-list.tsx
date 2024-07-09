import MergeRequest from '@/components/merge-request';
import { useStore } from '@/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { variants } from '@/lib/framer-motion';
import { observer } from 'mobx-react';
import { useUser } from '@clerk/nextjs';

const MergeRequestList = () => {
    const {
        dataStore: { getModelsByUserId }
    } = useStore();

    const { user } = useUser();

    if (!user) return null;

    const models = getModelsByUserId(user.externalAccounts[0].providerUserId);
    return (
        <div className="flex flex-col gap-2 py-1">
            <AnimatePresence mode="popLayout">
                {models.map((model, i) => {
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

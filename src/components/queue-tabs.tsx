import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { observer } from 'mobx-react';
import { useStore } from '@/hooks';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { variants } from '@/lib/framer-motion';

const QueueTabs = () => {
    const {
        uiStore: { queueTabKeys, activeRepository, setActiveRepository }
    } = useStore();

    return (
        <div className="flex h-9 w-max gap-1 rounded-lg text-muted-foreground">
            <LayoutGroup>
                <AnimatePresence mode="sync">
                    {queueTabKeys.map((key) => (
                        <motion.div
                            key={key}
                            variants={variants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            layout="position"
                            className="flex items-center justify-center rounded-lg bg-muted p-1"
                        >
                            <Button
                                type="button"
                                className={cn(
                                    'h-auto items-center justify-center whitespace-nowrap rounded-md bg-transparent px-3 py-1 text-sm font-semibold text-zinc-600 ring-offset-background hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:text-zinc-200',
                                    {
                                        'bg-background text-foreground shadow-sm hover:bg-background': key === activeRepository
                                    }
                                )}
                                onClick={() => setActiveRepository(key)}
                            >
                                {key}
                            </Button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </LayoutGroup>
        </div>
    );
};

export default observer(QueueTabs);

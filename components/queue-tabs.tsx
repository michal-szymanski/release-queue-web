import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { observer } from 'mobx-react';
import { useStore } from '@/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { variants } from '@/lib/framer-motion';

const QueueTabs = () => {
    const {
        uiStore: { queueTabKeys, activeRepository, setActiveRepository }
    } = useStore();

    return (
        <div className="h-9">
            <AnimatePresence mode="wait">
                {queueTabKeys.length > 0 && (
                    <motion.div
                        className="inline-block h-full rounded-lg bg-muted p-1 text-muted-foreground transition-opacity"
                        variants={variants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        layout="size"
                    >
                        <AnimatePresence mode="popLayout">
                            {queueTabKeys.map((key) => (
                                <motion.div
                                    key={key}
                                    className="inline-block"
                                    variants={variants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    layout="position"
                                >
                                    <Button
                                        type="button"
                                        className={cn(
                                            'h-auto items-center justify-center whitespace-nowrap rounded-md bg-transparent px-3 py-1 text-sm font-medium text-zinc-600 ring-offset-background transition-all hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:text-zinc-200',
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default observer(QueueTabs);

import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { observer } from 'mobx-react';
import { useStore } from '@/hooks';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const QueueTabs = () => {
    const {
        uiStore: { queueTabKeys, activeRepository, setActiveRepository }
    } = useStore();
    const [parent] = useAutoAnimate();

    return (
        <div className="h-9">
            <div
                className={clsx('inline-block h-full rounded-lg bg-muted p-1 text-muted-foreground opacity-0 transition-opacity', {
                    'opacity-100': queueTabKeys.length > 0
                })}
            >
                <div ref={parent}>
                    {queueTabKeys.map((key) => (
                        <div key={key} className="inline-block">
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default observer(QueueTabs);

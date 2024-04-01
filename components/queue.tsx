import QueueItems from '@/components/queue-items';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMergeRequestsStore } from '@/hooks';
import { observer } from 'mobx-react';

const Queue = () => {
    const { queueRepositories } = useMergeRequestsStore();
    return (
        <div className="overflow-hidden rounded-[0.5rem] bg-background">
            <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
                <div className="flex flex-col gap-5">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Queue</h2>
                    </div>
                    {queueRepositories.length > 0 && (
                        <Tabs defaultValue={queueRepositories[0]} className="w-[400px]">
                            <TabsList>
                                {queueRepositories.map((name) => (
                                    <TabsTrigger key={name} value={name}>
                                        {name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {queueRepositories.map((name) => (
                                <TabsContent key={name} value={name}>
                                    <QueueItems repositoryName={name} />
                                </TabsContent>
                            ))}
                        </Tabs>
                    )}
                </div>
            </div>
        </div>
    );
};

export default observer(Queue);

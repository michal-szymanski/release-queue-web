import QueueItems from '@/components/queue-items';

const Queue = () => {
    return (
        <div className="overflow-hidden rounded-[0.5rem] bg-background">
            <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
                <div className="flex flex-col gap-5">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Queue</h2>
                    </div>
                    <QueueItems />
                </div>
            </div>
        </div>
    );
};

export default Queue;

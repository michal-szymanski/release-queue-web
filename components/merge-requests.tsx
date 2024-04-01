import OpenMergeRequests from '@/components/open-merge-requests';

export const MergeRequests = () => {
    return (
        <div className="overflow-hidden rounded-[0.5rem] border bg-background shadow-md md:shadow-xl">
            <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
                <div className="flex flex-col gap-5">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Merge requests</h2>
                        <p className="text-muted-foreground">All of your open merge requests ready to queue.</p>
                    </div>
                    <OpenMergeRequests />
                </div>
            </div>
        </div>
    );
};

export default MergeRequests;

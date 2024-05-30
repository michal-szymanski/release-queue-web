// import { useMutation, useQuery } from '@tanstack/react-query';
// import { MergeRequestEvent, mergeRequestsResponseSchema, rebaseResponseSchema } from '@/types';
// import { useQueryClient } from '@tanstack/react-query';
//
// export const useMergeRequest = ({ event, enabled }: { event: MergeRequestEvent; enabled: boolean }) =>
//     useQuery({
//         queryKey: [`merge-request`, event.object_attributes.iid],
//         queryFn: async () => {
//             const url = `/api/gitlab/projects/${event.project.id}/merge-requests/${event.object_attributes.iid}`;
//
//             const response = await fetch(url, {
//                 method: 'GET'
//             });
//
//             const json = await response.json();
//             return mergeRequestsResponseSchema.parse(json);
//         },
//         refetchInterval: (query) => {
//             if (query.state.data?.detailed_merge_status === 'checking') {
//                 return 1000;
//             }
//         },
//         enabled
//     });
//
// export const useRebaseMutation = ({ event }: { event: MergeRequestEvent }) => {
//     const queryClient = useQueryClient();
//
//     return useMutation({
//         mutationFn: async () => {
//             const url = `/api/gitlab/projects/${event.project.id}/merge-requests/${event.object_attributes.iid}/rebase`;
//             const response = await fetch(url, {
//                 method: 'POST'
//             });
//
//             // if (response.ok) {
//             //     await queryClient.invalidateQueries({
//             //         queryKey: [`merge-request:${event.object_attributes.iid}`]
//             //     });
//             // }
//
//             const json = await response.json();
//             return rebaseResponseSchema.parse(json);
//         },
//         onMutate: async () => {
//             await queryClient.cancelQueries({ queryKey: ['merge-request', event.object_attributes.iid] });
//             const previous = mergeRequestsResponseSchema.parse(queryClient.getQueryData(['merge-request', event.object_attributes.iid]));
//             const optimistic = { ...previous, rebase_in_progress: true };
//             queryClient.setQueryData(['merge-request', event.object_attributes.iid], { ...previous, rebase_in_progress: true });
//
//             return { previous, optimistic };
//         },
//         onError: (_error, _variables, context) => {
//             if (!context) return;
//             queryClient.setQueryData(['merge-request', context.previous.iid], context.previous);
//         },
//         onSettled: () => {
//             queryClient.invalidateQueries({ queryKey: ['merge-request', event.object_attributes.iid] });
//         }
//     });
// };

import { ProjectViews } from "@/modules/projects/ui/views/project-views";
import { getQueryClient ,trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

interface pageProps{
        params: Promise<{
                projectId:string
        }>
};

const page= async ({params}:pageProps)=>{
        const {projectId} = await params;
        const queryClient =  getQueryClient();
        void queryClient.prefetchQuery(trpc.projects.getMany.queryOptions(
                {
                projectId:projectId
        }
        ));
        void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
               id: projectId,
        }));

        return (
                <HydrationBoundary state={dehydrate(queryClient)} >
                        <ProjectViews projectId={projectId}/>
                </HydrationBoundary>
        )
}

export default page;
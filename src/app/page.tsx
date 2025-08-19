import { caller, getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Client from "./client";
import { Suspense } from "react";

const Page =  async() => {
  // console.log("SERVER COMPONENT");
  // const data = await caller.hello({text:"Ankit singh"});
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.hello.queryOptions({text:"ankit singh"}));
  return ( 
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading..</p>} >
        <Client/>
      </Suspense>
    </HydrationBoundary>
   );
}
 
export default Page;
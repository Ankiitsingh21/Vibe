import { projectsRouter } from "@/modules/projects/server/procedures";
import { createTRPCRouter } from "../init";
import { messagesRouter } from "@/modules/messages/server/procedures";
import { usageRouter } from "@/modules/usage/server/procedures";
export const appRouter = createTRPCRouter({
  Usage:usageRouter,
  messages: messagesRouter,
  projects: projectsRouter,
  //  fragments : fragmentRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

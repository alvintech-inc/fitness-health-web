import { sessionRouter } from "./apis/session/session-router";
import { storageRouter } from "./apis/storage/storage-router";

export const appRouter = {
  session: sessionRouter,
  storage: storageRouter,
};

export type AppRouter = typeof appRouter;

import { createORPCClient, onError } from "@orpc/client";
import type { RouterClient } from '@orpc/server'
import { RPCLink } from "@orpc/client/fetch";
import { createRouterUtils } from "@orpc/tanstack-query";
import type { AppRouter } from "./router";

const link = new RPCLink({
  url: `${typeof window !== 'undefined' ? window.location.origin : ""}/api/v1/orpc`,
  headers: async () => {
    if (typeof window !== 'undefined') {
      return {}
    }

    const { headers } = await import('next/headers')
    return await headers()
  },
});

export const orpc: RouterClient<AppRouter> = createORPCClient(link)

export const orpcTQUtils = createRouterUtils(orpc);

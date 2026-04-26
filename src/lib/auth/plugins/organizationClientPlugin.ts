import { inferOrgAdditionalFields, organizationClient } from "better-auth/client/plugins";
import { auth } from "../auth";

export const organizationClientPlugin = organizationClient({
    teams: { enabled: true },
    schema: inferOrgAdditionalFields<typeof auth>()
})
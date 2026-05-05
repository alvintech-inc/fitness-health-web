export const routes = {
  dashboard: {
    root: () => "/dashboard",
    data: () => "/dashboard/data",
    insights: () => "/dashboard/insights",
    settings: () => "/dashboard/settings",
    // kept for compatibility
    integrations: () => "/dashboard/settings",
    labResults: () => "/dashboard/lab-results",
    trends: () => "/dashboard/trends",
    members: () => "/dashboard/members",
    memberProfile: (userId: string) => `/dashboard/members/${userId}`,
    organizations: () => "/dashboard/organizations",
    acceptInvitation: (invitationId: string) => `/dashboard/accept-invitation?id=${invitationId}`,
  },
  admin: {
    root: () => "/admin",
    users: () => "/admin/users",
  },
  authParent: () => "/auth",
  auth: {
    signIn: (callbackUrl?: string) => `/auth/sign-in${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`,
    signUp: () => "/auth/sign-up",
    pendingEmailVerification: () => "/auth/pending-email-verification",
    resetPassword: () => "/auth/reset-password",
    newPassword: () => "/auth/new-password",
    goodbye: () => "/auth/goodbye",
    deleteAccount: () => "/auth/delete-account", // used only if sendDeleteAccountVerification is provided in auth.ts
  },
  checkIn: (code?: string) => `/check-in${code ? `?code=${encodeURIComponent(code)}` : ''}`,
  landing: {
    root: () => "/",
    privacy: () => "/privacy",
    terms: () => "/terms",
  }
};

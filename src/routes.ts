export const routes = {
  dashboard: {
    root: () => "/dashboard",
    // Health
    vitals: () => "/dashboard/vitals",
    labResults: () => "/dashboard/lab-results",
    bodyMetrics: () => "/dashboard/body-metrics",
    medications: () => "/dashboard/medications",
    sleep: () => "/dashboard/sleep",
    // Fitness
    workouts: () => "/dashboard/workouts",
    exercises: () => "/dashboard/exercises",
    cardio: () => "/dashboard/cardio",
    // Nutrition
    diet: () => "/dashboard/diet",
    calories: () => "/dashboard/calories",
    water: () => "/dashboard/water",
    // Insights
    trends: () => "/dashboard/trends",
    goals: () => "/dashboard/goals",
    reports: () => "/dashboard/reports",
    // Account
    integrations: () => "/dashboard/integrations",
    settings: () => "/dashboard/settings",
    // Legacy / misc
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

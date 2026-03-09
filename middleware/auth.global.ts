import { authClient } from "~/lib/auth-client";
import { ensureActiveOrganization } from "~/lib/organization-session";

export default defineNuxtRouteMiddleware(async (to) => {
  const organizationSetupRoute = "/organization/setup";
  const publicRoutes = new Set([
    "/auth",
    "/auth/register",
    "/auth/forgot-password",
  ]);
  const isPublicRoute = publicRoutes.has(to.path);
  const sessionResult = await authClient.getSession();
  const session = sessionResult.data;

  if (!session) {
    if (isPublicRoute) {
      return;
    }

    return navigateTo("/auth");
  }

  const orgState = await ensureActiveOrganization(session);
  const hasActiveOrganization = orgState.hasActiveOrganization;
  const hasOrganizations = orgState.hasOrganizations;

  const mustCompleteOrganizationSetup =
    !hasActiveOrganization && !hasOrganizations;
  const authenticatedLandingRoute = mustCompleteOrganizationSetup
    ? organizationSetupRoute
    : "/";

  if (isPublicRoute) {
    return navigateTo(authenticatedLandingRoute);
  }

  if (mustCompleteOrganizationSetup && to.path !== organizationSetupRoute) {
    return navigateTo(organizationSetupRoute);
  }

  if (!mustCompleteOrganizationSetup && to.path === organizationSetupRoute) {
    return navigateTo("/");
  }
});

import { authClient } from "~/lib/auth-client";

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

  const hasActiveOrganization = Boolean(session.session.activeOrganizationId);
  let hasOrganizations = false;

  if (!hasActiveOrganization) {
    try {
      const organizations = await $fetch<unknown[]>(
        "/api/auth/organization/list",
        {
          method: "GET",
        },
      );
      hasOrganizations =
        Array.isArray(organizations) && organizations.length > 0;
    } catch {
      hasOrganizations = false;
    }
  }

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

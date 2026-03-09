import { authClient } from "./auth-client";

type SessionData = Awaited<ReturnType<typeof authClient.getSession>>["data"];

type OrganizationSummary = {
  id: string;
};

export type EnsureActiveOrganizationResult = {
  hasSession: boolean;
  hasActiveOrganization: boolean;
  hasOrganizations: boolean;
  activatedOrganization: boolean;
};

export async function ensureActiveOrganization(
  sessionData?: SessionData | null,
): Promise<EnsureActiveOrganizationResult> {
  const session =
    sessionData === undefined
      ? (await authClient.getSession()).data
      : sessionData;

  if (!session) {
    return {
      hasSession: false,
      hasActiveOrganization: false,
      hasOrganizations: false,
      activatedOrganization: false,
    };
  }

  if (session.session.activeOrganizationId) {
    return {
      hasSession: true,
      hasActiveOrganization: true,
      hasOrganizations: true,
      activatedOrganization: false,
    };
  }

  try {
    const organizations = await $fetch<OrganizationSummary[]>(
      "/api/auth/organization/list",
      { method: "GET" },
    );
    const firstOrganizationId =
      Array.isArray(organizations) && organizations.length > 0
        ? organizations[0]?.id
        : undefined;

    if (!firstOrganizationId) {
      return {
        hasSession: true,
        hasActiveOrganization: false,
        hasOrganizations: false,
        activatedOrganization: false,
      };
    }

    await $fetch("/api/auth/organization/set-active", {
      method: "POST",
      body: {
        organizationId: firstOrganizationId,
      },
    });

    return {
      hasSession: true,
      hasActiveOrganization: true,
      hasOrganizations: true,
      activatedOrganization: true,
    };
  } catch {
    return {
      hasSession: true,
      hasActiveOrganization: false,
      hasOrganizations: false,
      activatedOrganization: false,
    };
  }
}

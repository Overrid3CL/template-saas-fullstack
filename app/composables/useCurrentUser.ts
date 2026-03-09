import { authClient } from "~~/lib/auth-client";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type UpdateCurrentUserInput = {
  name?: string;
  image?: string;
};

export function useCurrentUser() {
  const currentUser = useState<SessionUser | null>("auth:current-user", () => null);
  const initialized = useState<boolean>("auth:current-user:initialized", () => false);
  const loading = useState<boolean>("auth:current-user:loading", () => false);

  async function refreshCurrentUser() {
    loading.value = true;
    try {
      const sessionResult = await authClient.getSession();
      currentUser.value = (sessionResult.data?.user as SessionUser | undefined) ?? null;
      initialized.value = true;
      return currentUser.value;
    } finally {
      loading.value = false;
    }
  }

  async function ensureCurrentUser() {
    if (!initialized.value) {
      await refreshCurrentUser();
    }
    return currentUser.value;
  }

  async function updateCurrentUser(input: UpdateCurrentUserInput) {
    const result = await authClient.updateUser(input);

    if (result.error) {
      throw new Error(result.error.message || "No se pudo actualizar el perfil");
    }

    await refreshCurrentUser();
    return result;
  }

  function clearCurrentUser() {
    currentUser.value = null;
    initialized.value = false;
  }

  return {
    currentUser,
    loading,
    ensureCurrentUser,
    refreshCurrentUser,
    updateCurrentUser,
    clearCurrentUser,
  };
}

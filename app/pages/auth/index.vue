<script setup lang="ts">
import type { AuthFormField, FormError, FormSubmitEvent } from "@nuxt/ui";
import { authClient } from "~~/lib/auth-client";

definePageMeta({
  layout: "auth",
});

type LoginForm = {
  email: string;
  password: string;
};

const errorMessage = ref("");
const loading = ref(false);

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Correo",
    placeholder: "tu@email.com",
    required: true,
  },
  {
    name: "password",
    type: "password",
    label: "Contrasena",
    placeholder: "********",
    required: true,
  },
];

const providers = [
  {
    label: "Continuar con GitHub",
    icon: "i-simple-icons-github",
    color: "neutral" as const,
    variant: "outline" as const,
    onClick: signInWithGithub,
  },
];

function validate(state: Partial<LoginForm>): FormError<string>[] {
  const errors: FormError<string>[] = [];

  if (!state.email?.trim()) {
    errors.push({ name: "email", message: "El email es obligatorio" });
  } else if (!/^\S+@\S+\.\S+$/.test(state.email)) {
    errors.push({ name: "email", message: "Ingresa un email valido" });
  }

  if (!state.password) {
    errors.push({ name: "password", message: "La contrasena es obligatoria" });
  } else if (state.password.length < 8) {
    errors.push({ name: "password", message: "Minimo 8 caracteres" });
  }

  return errors;
}

async function signInWithGithub() {
  errorMessage.value = "";
  await authClient.signIn.social({ provider: "github" });
}

async function resolvePostAuthRoute() {
  const sessionResult = await authClient.getSession();
  const session = sessionResult.data;
  const hasActiveOrganization = Boolean(session?.session.activeOrganizationId);

  if (hasActiveOrganization) {
    return "/dashboard";
  }

  try {
    const organizations = await $fetch<unknown[]>("/api/auth/organization/list", {
      method: "GET",
    });
    const hasOrganizations = Array.isArray(organizations) && organizations.length > 0;
    return hasOrganizations ? "/dashboard" : "/organization/setup";
  } catch {
    return "/organization/setup";
  }
}

async function onSubmit(payload: FormSubmitEvent<LoginForm>) {
  try {
    loading.value = true;
    errorMessage.value = "";

    const result = await authClient.signIn.email({
      email: payload.data.email,
      password: payload.data.password,
    });

    if (result.error) {
      errorMessage.value = result.error.message ?? "Credenciales incorrectas";
      return;
    }

    const redirectTo = await resolvePostAuthRoute();
    await navigateTo(redirectTo);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UPageCard>
    <UAuthForm
      title="Iniciar sesion"
      description="Ingresa con email y contrasena para continuar."
      icon="i-lucide-lock"
      :fields="fields"
      :providers="providers"
      :validate="validate"
      :loading="loading"
      :submit="{ label: 'Entrar', block: true }"
      @submit="onSubmit"
    >
      <template #description>
        No tienes cuenta?
        <ULink to="/auth/register" class="text-primary font-medium">
          Registrate aqui </ULink
        >.
      </template>

      <template #password-hint>
        <ULink
          to="/auth/forgot-password"
          class="text-primary font-medium"
          tabindex="-1"
        >
          Olvide mi contraseña
        </ULink>
      </template>

      <template #validation>
        <UAlert
          v-if="errorMessage"
          color="error"
          icon="i-lucide-circle-alert"
          :title="errorMessage"
        />
      </template>
    </UAuthForm>
  </UPageCard>
</template>

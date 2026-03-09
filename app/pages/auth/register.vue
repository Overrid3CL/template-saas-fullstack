<script setup lang="ts">
import type { AuthFormField, FormError, FormSubmitEvent } from "@nuxt/ui";
import { authClient } from "~~/lib/auth-client";
import { ensureActiveOrganization } from "~~/lib/organization-session";

definePageMeta({
  layout: "auth",
});

type RegisterForm = {
  name: string;
  email: string;
  password: string;
};

const errorMessage = ref("");
const loading = ref(false);

const fields: AuthFormField[] = [
  {
    name: "name",
    type: "text",
    label: "Nombre",
    placeholder: "Ada Lovelace",
    required: true,
  },
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
    label: "contraseña",
    placeholder: "********",
    required: true,
  },
];

function validate(state: Partial<RegisterForm>): FormError<string>[] {
  const errors: FormError<string>[] = [];

  if (!state.name?.trim()) {
    errors.push({ name: "name", message: "El nombre es obligatorio" });
  }

  if (!state.email?.trim()) {
    errors.push({ name: "email", message: "El email es obligatorio" });
  } else if (!/^\S+@\S+\.\S+$/.test(state.email)) {
    errors.push({ name: "email", message: "Ingresa un email valido" });
  }

  if (!state.password) {
    errors.push({ name: "password", message: "La contraseña es obligatoria" });
  } else if (state.password.length < 8) {
    errors.push({ name: "password", message: "Minimo 8 caracteres" });
  }

  return errors;
}

async function resolvePostAuthRoute() {
  const orgState = await ensureActiveOrganization();
  return orgState.hasActiveOrganization ? "/" : "/organization/setup";
}

async function onSubmit(payload: FormSubmitEvent<RegisterForm>) {
  try {
    loading.value = true;
    errorMessage.value = "";

    const result = await authClient.signUp.email({
      name: payload.data.name,
      email: payload.data.email,
      password: payload.data.password,
    });

    if (result.error) {
      errorMessage.value = result.error.message ?? "No se pudo crear la cuenta";
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
      title="Crear cuenta"
      description="Registrate con email y contraseña."
      icon="i-lucide-user-plus"
      :fields="fields"
      :validate="validate"
      :loading="loading"
      :submit="{ label: 'Crear cuenta', block: true }"
      @submit="onSubmit"
    >
      <template #description>
        Ya tienes cuenta?
        <ULink to="/auth" class="text-primary font-medium">
          Inicia sesion </ULink
        >.
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

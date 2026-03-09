<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

import * as z from "zod";
import type { FormError, FormSubmitEvent } from "@nuxt/ui";
import { authClient } from "~~/lib/auth-client";

const passwordSchema = z.object({
  current: z.string().min(8, "Debe tener al menos 8 caracteres"),
  new: z.string().min(8, "Debe tener al menos 8 caracteres"),
});

type PasswordSchema = z.output<typeof passwordSchema>;

const password = reactive<Partial<PasswordSchema>>({
  current: "",
  new: "",
});
const saving = ref(false);
const toast = useToast();
const deleting = ref(false);
const deleteModalOpen = ref(false);
const deleteConfirmation = ref("");
const { deleteAccount } = useProfileSettings();

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = [];
  if (state.current && state.new && state.current === state.new) {
    errors.push({
      name: "new",
      message: "Las contraseñas deben ser diferentes",
    });
  }
  return errors;
};

async function onSubmit(event: FormSubmitEvent<PasswordSchema>) {
  saving.value = true;

  try {
    const result = await authClient.changePassword({
      currentPassword: event.data.current,
      newPassword: event.data.new,
      revokeOtherSessions: true,
    });

    if (result.error) {
      throw new Error(result.error.message || "No se pudo actualizar la contraseña");
    }

    password.current = "";
    password.new = "";

    toast.add({
      title: "Contraseña actualizada",
      description: "Tu contraseña se cambió correctamente.",
      icon: "i-lucide-check",
      color: "success",
    });
  } catch (error: any) {
    toast.add({
      title: "No se pudo actualizar",
      description: error?.message || "Verifica tu contraseña actual e intenta de nuevo.",
      icon: "i-lucide-circle-alert",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}

async function onDeleteAccount() {
  deleting.value = true;
  try {
    await deleteAccount(deleteConfirmation.value);
    await authClient.signOut();
    await navigateTo("/auth");
  } catch (error: any) {
    toast.add({
      title: "No se pudo eliminar la cuenta",
      description: error?.data?.message || error?.message || "Intenta nuevamente.",
      icon: "i-lucide-circle-alert",
      color: "error",
    });
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <UPageCard
    title="contraseña"
    description="Confirma tu contraseña actual antes de establecer una nueva."
    variant="subtle"
  >
    <UForm
      :schema="passwordSchema"
      :state="password"
      :validate="validate"
      class="flex flex-col gap-4 max-w-xs"
      @submit="onSubmit"
    >
      <UFormField name="current">
        <UInput
          v-model="password.current"
          type="password"
          placeholder="contraseña actual"
          class="w-full"
        />
      </UFormField>

      <UFormField name="new">
        <UInput
          v-model="password.new"
          type="password"
          placeholder="Nueva contraseña"
          class="w-full"
        />
      </UFormField>

      <UButton label="Actualizar" class="w-fit" type="submit" :loading="saving" />
    </UForm>
  </UPageCard>

  <UPageCard
    title="Cuenta"
    description="Si ya no quieres usar el servicio, puedes eliminar tu cuenta aqui. Esta accion no se puede deshacer. Toda la informacion asociada se eliminara de forma permanente."
    class="bg-linear-to-tl from-error/10 from-5% to-default"
  >
    <template #footer>
      <UButton label="Eliminar cuenta" color="error" @click="deleteModalOpen = true" />
    </template>
  </UPageCard>

  <UModal v-model:open="deleteModalOpen" title="Eliminar cuenta">
    <template #body>
      <div class="space-y-4 text-sm">
        <p>Esta accion es permanente. Escribe <strong>ELIMINAR</strong> para confirmar.</p>
        <UInput v-model="deleteConfirmation" placeholder="ELIMINAR" />
        <UButton
          label="Confirmar eliminacion"
          color="error"
          :disabled="deleteConfirmation !== 'ELIMINAR'"
          :loading="deleting"
          @click="onDeleteAccount"
        />
      </div>
    </template>
  </UModal>
</template>

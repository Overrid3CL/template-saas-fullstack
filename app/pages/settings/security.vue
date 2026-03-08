<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

import * as z from "zod";
import type { FormError } from "@nuxt/ui";

const passwordSchema = z.object({
  current: z.string().min(8, "Debe tener al menos 8 caracteres"),
  new: z.string().min(8, "Debe tener al menos 8 caracteres"),
});

type PasswordSchema = z.output<typeof passwordSchema>;

const password = reactive<Partial<PasswordSchema>>({
  current: "",
  new: "",
});

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = [];
  if (state.current && state.new && state.current === state.new) {
    errors.push({ name: "new", message: "Las contrasenas deben ser diferentes" });
  }
  return errors;
};
</script>

<template>
  <UPageCard
    title="Contrasena"
    description="Confirma tu contrasena actual antes de establecer una nueva."
    variant="subtle"
  >
    <UForm
      :schema="passwordSchema"
      :state="password"
      :validate="validate"
      class="flex flex-col gap-4 max-w-xs"
    >
      <UFormField name="current">
        <UInput
          v-model="password.current"
          type="password"
          placeholder="Contrasena actual"
          class="w-full"
        />
      </UFormField>

      <UFormField name="new">
        <UInput
          v-model="password.new"
          type="password"
          placeholder="Nueva contrasena"
          class="w-full"
        />
      </UFormField>

      <UButton label="Actualizar" class="w-fit" type="submit" />
    </UForm>
  </UPageCard>

  <UPageCard
    title="Cuenta"
    description="Si ya no quieres usar el servicio, puedes eliminar tu cuenta aqui. Esta accion no se puede deshacer. Toda la informacion asociada se eliminara de forma permanente."
    class="bg-gradient-to-tl from-error/10 from-5% to-default"
  >
    <template #footer>
      <UButton label="Eliminar cuenta" color="error" />
    </template>
  </UPageCard>
</template>

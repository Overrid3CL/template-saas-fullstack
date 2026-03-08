<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const fileRef = ref<HTMLInputElement>();

const profileSchema = z.object({
  name: z.string().min(2, "Muy corto"),
  email: z.string().email("Correo invalido"),
  username: z.string().min(2, "Muy corto"),
  avatar: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileSchema = z.output<typeof profileSchema>;

const profile = reactive<Partial<ProfileSchema>>({
  name: "Benjamin Canac",
  email: "ben@nuxtlabs.com",
  username: "benjamincanac",
  avatar: undefined,
  bio: undefined,
});
const toast = useToast();
async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
  toast.add({
    title: "Listo",
    description: "Tu configuracion se actualizo correctamente.",
    icon: "i-lucide-check",
    color: "success",
  });
  console.log(event.data);
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  profile.avatar = URL.createObjectURL(input.files[0]!);
}

function onFileClick() {
  fileRef.value?.click();
}
</script>

<template>
  <UForm
    id="settings"
    :schema="profileSchema"
    :state="profile"
    @submit="onSubmit"
  >
    <UPageCard
      title="Perfil"
      description="Esta informacion se mostrara publicamente."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        form="settings"
        label="Guardar cambios"
        color="neutral"
        type="submit"
        class="w-fit lg:ms-auto"
      />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="name"
        label="Nombre"
        description="Aparecera en recibos, facturas y otras comunicaciones."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput v-model="profile.name" autocomplete="off" />
      </UFormField>
      <USeparator />
      <UFormField
        name="email"
        label="Correo"
        description="Se usa para iniciar sesion, recibir comprobantes y novedades."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput v-model="profile.email" type="email" autocomplete="off" />
      </UFormField>
      <USeparator />
      <UFormField
        name="username"
        label="Usuario"
        description="Tu nombre de usuario unico para acceder y para tu URL de perfil."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput v-model="profile.username" type="username" autocomplete="off" />
      </UFormField>
      <USeparator />
      <UFormField
        name="avatar"
        label="Avatar"
        description="JPG, GIF o PNG. Maximo 1 MB."
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar :src="profile.avatar" :alt="profile.name" size="lg" />
          <UButton label="Elegir" color="neutral" @click="onFileClick" />
          <input
            ref="fileRef"
            type="file"
            class="hidden"
            accept=".jpg, .jpeg, .png, .gif"
            @change="onFileChange"
          />
        </div>
      </UFormField>
      <USeparator />
      <UFormField
        name="bio"
        label="Biografia"
        description="Descripcion breve de tu perfil. Las URL se enlazan automaticamente."
        class="flex max-sm:flex-col justify-between items-start gap-4"
        :ui="{ container: 'w-full' }"
      >
        <UTextarea v-model="profile.bio" :rows="5" autoresize class="w-full" />
      </UFormField>
    </UPageCard>
  </UForm>
</template>

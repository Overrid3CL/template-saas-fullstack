<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const fileRef = ref<HTMLInputElement>();
const saving = ref(false);
const uploadingAvatar = ref(false);
const toast = useToast();
const { profile: persistedProfile, refreshProfile, updateProfile, createAvatarUploadUrl } =
  useProfileSettings();

await refreshProfile();

const profileSchema = z.object({
  name: z.string().min(2, "Muy corto"),
  email: z.string().email("Correo invalido"),
  username: z.string().optional(),
  avatar: z.string().optional(),
});

type ProfileSchema = z.output<typeof profileSchema>;

const profile = reactive<Partial<ProfileSchema>>({
  name: "",
  email: "",
  username: "",
  avatar: undefined,
});

watch(
  persistedProfile,
  (nextProfile) => {
    const email = nextProfile?.email || "";
    profile.name = nextProfile?.name || email || "";
    profile.email = email;
    profile.username = nextProfile?.username || (email ? email.split("@")[0] : "");
    profile.avatar = nextProfile?.image || undefined;
  },
  { immediate: true },
);

async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
  saving.value = true;

  const image = event.data.avatar?.startsWith("blob:")
    ? undefined
    : event.data.avatar;

  try {
    await updateProfile({
      name: event.data.name,
      image,
    });

    toast.add({
      title: "Perfil actualizado",
      description: "Guardamos los cambios de tu cuenta.",
      icon: "i-lucide-check",
      color: "success",
    });
  } catch (error: any) {
    toast.add({
      title: "No se pudo guardar",
      description: error?.message || "Intenta nuevamente en unos segundos.",
      icon: "i-lucide-circle-alert",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  void uploadAvatar(input.files[0]!);
}

function onFileClick() {
  fileRef.value?.click();
}

async function uploadAvatar(file: File) {
  uploadingAvatar.value = true;
  const localPreview = URL.createObjectURL(file);
  profile.avatar = localPreview;

  try {
    const uploadInfo = await createAvatarUploadUrl({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
    });

    await fetch(uploadInfo.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    profile.avatar = uploadInfo.publicUrl;
    await updateProfile({
      name: profile.name || persistedProfile.value?.name || "",
      image: uploadInfo.publicUrl,
    });

    toast.add({
      title: "Avatar actualizado",
      description: "La imagen se subio correctamente.",
      icon: "i-lucide-check",
      color: "success",
    });
  } catch (error: any) {
    profile.avatar = persistedProfile.value?.image || undefined;
    toast.add({
      title: "No se pudo subir el avatar",
      description: error?.data?.message || error?.message || "Intenta nuevamente.",
      icon: "i-lucide-circle-alert",
      color: "error",
    });
  } finally {
    uploadingAvatar.value = false;
  }
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
        :loading="saving"
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
        <UInput
          v-model="profile.email"
          type="email"
          autocomplete="off"
          disabled
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="username"
        label="Usuario"
        description="Se genera automaticamente desde tu correo por ahora."
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.username"
          type="username"
          autocomplete="off"
          disabled
        />
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
          <UButton
            label="Elegir"
            color="neutral"
            :loading="uploadingAvatar"
            @click="onFileClick"
          />
          <input
            ref="fileRef"
            type="file"
            class="hidden"
            accept=".jpg, .jpeg, .png, .gif"
            @change="onFileChange"
          />
        </div>
      </UFormField>
    </UPageCard>
  </UForm>
</template>

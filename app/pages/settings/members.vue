<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const toast = useToast();
const {
  members,
  loading,
  refreshMembers,
  inviteMember,
  changeMemberRole,
  removeMember,
} = useMembersSettings();

await refreshMembers();

const inviteOpen = ref(false);
const inviting = ref(false);

const inviteSchema = z.object({
  email: z.string().email("Correo invalido"),
  role: z.enum(["member", "owner"]).default("member"),
});

type InviteSchema = z.output<typeof inviteSchema>;

const inviteState = reactive<Partial<InviteSchema>>({
  email: "",
  role: "member",
});

const q = ref("");

const filteredMembers = computed(() => {
  return members.value.filter((member) => {
    return (
      member.name.search(new RegExp(q.value, "i")) !== -1 ||
      member.username.search(new RegExp(q.value, "i")) !== -1
    );
  });
});

async function onInvite(event: FormSubmitEvent<InviteSchema>) {
  inviting.value = true;
  try {
    await inviteMember({
      email: event.data.email,
      role: event.data.role,
    });
    inviteOpen.value = false;
    inviteState.email = "";
    inviteState.role = "member";
    toast.add({
      title: "Invitacion enviada",
      description: "La invitacion fue creada correctamente.",
      icon: "i-lucide-check",
      color: "success",
    });
  } catch (error: any) {
    toast.add({
      title: "No se pudo enviar la invitacion",
      description: error?.data?.message || error?.message || "Intenta nuevamente.",
      icon: "i-lucide-circle-alert",
      color: "error",
    });
  } finally {
    inviting.value = false;
  }
}

async function onRoleChange(memberId: string, role: "member" | "owner") {
  try {
    await changeMemberRole(memberId, { role });
    toast.add({
      title: "Rol actualizado",
      description: "El cambio se guardo correctamente.",
      icon: "i-lucide-check",
      color: "success",
    });
  } catch (error: any) {
    await refreshMembers();
    toast.add({
      title: "No se pudo actualizar el rol",
      description: error?.data?.message || error?.message || "Intenta nuevamente.",
      icon: "i-lucide-circle-alert",
      color: "error",
    });
  }
}

async function onRemoveMember(memberId: string) {
  try {
    await removeMember(memberId);
    toast.add({
      title: "Miembro removido",
      description: "El usuario fue removido de la organizacion.",
      icon: "i-lucide-check",
      color: "success",
    });
  } catch (error: any) {
    toast.add({
      title: "No se pudo remover el miembro",
      description: error?.data?.message || error?.message || "Intenta nuevamente.",
      icon: "i-lucide-circle-alert",
      color: "error",
    });
  }
}
</script>

<template>
  <div>
    <UPageCard
      title="Miembros"
      description="Invita nuevos miembros por correo electronico."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        label="Invitar personas"
        color="neutral"
        class="w-fit lg:ms-auto"
        @click="inviteOpen = true"
      />
    </UPageCard>

    <UModal v-model:open="inviteOpen" title="Invitar persona">
      <template #body>
        <UForm :schema="inviteSchema" :state="inviteState" class="space-y-4" @submit="onInvite">
          <UFormField name="email" label="Correo">
            <UInput v-model="inviteState.email" type="email" class="w-full" />
          </UFormField>
          <UFormField name="role" label="Rol">
            <USelect
              v-model="inviteState.role"
              :items="[
                { label: 'Miembro', value: 'member' },
                { label: 'Propietario', value: 'owner' }
              ]"
              class="w-full"
            />
          </UFormField>
          <UButton type="submit" label="Enviar invitacion" :loading="inviting" />
        </UForm>
      </template>
    </UModal>

    <UPageCard
      variant="subtle"
      :ui="{
        container: 'p-0 sm:p-0 gap-y-0',
        wrapper: 'items-stretch',
        header: 'p-4 mb-0 border-b border-default',
      }"
    >
      <template #header>
        <UInput
          v-model="q"
          icon="i-lucide-search"
          placeholder="Buscar miembros"
          autofocus
          class="w-full"
        />
      </template>

      <template v-if="loading">
        <div class="p-4 text-sm text-muted">Cargando miembros...</div>
      </template>
      <SettingsMembersList
        v-else
        :members="filteredMembers"
        @role-change="onRoleChange"
        @remove="onRemoveMember"
      />
    </UPageCard>
  </div>
</template>

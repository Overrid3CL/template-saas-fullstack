<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

type NotificationKey =
  | "email"
  | "desktop"
  | "product_updates"
  | "weekly_digest"
  | "important_updates";

type NotificationState = Record<NotificationKey, boolean>;

const state = reactive<NotificationState>({
  email: true,
  desktop: false,
  product_updates: true,
  weekly_digest: false,
  important_updates: true,
});
const toast = useToast();
const { preferences, refreshPreferences, savePreferences, saving } = useNotificationSettings();

await refreshPreferences();

watch(
  preferences,
  (value) => {
    state.email = value.email;
    state.desktop = value.desktop;
    state.product_updates = value.product_updates;
    state.weekly_digest = value.weekly_digest;
    state.important_updates = value.important_updates;
  },
  { immediate: true },
);

const sections = [
  {
    title: "Canales de notificacion",
    description: "Donde podemos avisarte?",
    fields: [
      {
        name: "email" as NotificationKey,
        label: "Correo",
        description: "Recibir un resumen diario por correo.",
      },
      {
        name: "desktop" as NotificationKey,
        label: "Escritorio",
        description: "Recibir notificaciones en el escritorio.",
      },
    ],
  },
  {
    title: "Actualizaciones de la cuenta",
    description: "Recibir novedades de Nuxt UI.",
    fields: [
      {
        name: "weekly_digest" as NotificationKey,
        label: "Resumen semanal",
        description: "Recibir un resumen semanal de novedades.",
      },
      {
        name: "product_updates" as NotificationKey,
        label: "Actualizaciones del producto",
        description:
          "Recibir un correo mensual con nuevas funciones y actualizaciones.",
      },
      {
        name: "important_updates" as NotificationKey,
        label: "Actualizaciones importantes",
        description:
          "Recibir correos sobre cambios importantes como seguridad, mantenimiento, etc.",
      },
    ],
  },
];

async function onChange() {
  try {
    await savePreferences({
      email: state.email,
      desktop: state.desktop,
      product_updates: state.product_updates,
      weekly_digest: state.weekly_digest,
      important_updates: state.important_updates,
    });
  } catch (error: any) {
    toast.add({
      title: "No se pudieron guardar las preferencias",
      description: error?.data?.message || error?.message || "Intenta nuevamente.",
      icon: "i-lucide-circle-alert",
      color: "error",
    });
  }
}
</script>

<template>
  <div v-for="(section, index) in sections" :key="index">
    <UPageCard
      :title="section.title"
      :description="section.description"
      variant="naked"
      class="mb-4"
    />

    <UPageCard variant="subtle" :ui="{ container: 'divide-y divide-default' }">
      <UFormField
        v-for="field in section.fields"
        :key="field.name"
        :name="field.name"
        :label="field.label"
        :description="field.description"
        class="flex items-center justify-between not-last:pb-4 gap-2"
      >
        <USwitch
          v-model="state[field.name]"
          :disabled="saving"
          @update:model-value="onChange"
        />
      </UFormField>
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

const state = reactive<{ [key: string]: boolean }>({
  email: true,
  desktop: false,
  product_updates: true,
  weekly_digest: false,
  important_updates: true,
});

const sections = [
  {
    title: "Canales de notificacion",
    description: "Donde podemos avisarte?",
    fields: [
      {
        name: "email",
        label: "Correo",
        description: "Recibir un resumen diario por correo.",
      },
      {
        name: "desktop",
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
        name: "weekly_digest",
        label: "Resumen semanal",
        description: "Recibir un resumen semanal de novedades.",
      },
      {
        name: "product_updates",
        label: "Actualizaciones del producto",
        description:
          "Recibir un correo mensual con nuevas funciones y actualizaciones.",
      },
      {
        name: "important_updates",
        label: "Actualizaciones importantes",
        description:
          "Recibir correos sobre cambios importantes como seguridad, mantenimiento, etc.",
      },
    ],
  },
];

async function onChange() {
  // Do something with data
  console.log(state);
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
        <USwitch v-model="state[field.name]" @update:model-value="onChange" />
      </UFormField>
    </UPageCard>
  </div>
</template>

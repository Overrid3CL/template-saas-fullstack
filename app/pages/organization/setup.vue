<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const loading = ref(false)
const errorMessage = ref('')
const organizationName = ref('')

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function createOrganization() {
  const name = organizationName.value.trim()

  if (!name) {
    errorMessage.value = 'El nombre de la organizacion es obligatorio'
    return
  }

  const slug = slugify(name)

  if (!slug) {
    errorMessage.value = 'Ingresa un nombre valido para crear la organizacion'
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''

    const response = await $fetch('/api/auth/organization/create', {
      method: 'POST',
      body: {
        name,
        slug
      }
    })

    if (!response) {
      errorMessage.value = 'No se pudo crear la organizacion'
      return
    }

    await navigateTo('/dashboard')
  } catch (error: any) {
    errorMessage.value = error?.data?.message ?? 'No se pudo crear la organizacion'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-xl space-y-8">
    <UPageHeader
      title="Crea tu organizacion"
      description="Para continuar, necesitas crear tu primera organizacion."
    />

    <UCard>
      <form
        class="space-y-4"
        @submit.prevent="createOrganization"
      >
        <UFormField
          label="Nombre de la organizacion"
          name="organizationName"
          required
        >
          <UInput
            v-model="organizationName"
            placeholder="Ejemplo: Mantenimiento Global"
          />
        </UFormField>

        <UAlert
          v-if="errorMessage"
          color="error"
          icon="i-lucide-circle-alert"
          :title="errorMessage"
        />

        <UButton
          type="submit"
          block
          :loading="loading"
        >
          Crear organizacion
        </UButton>
      </form>
    </UCard>
  </div>
</template>

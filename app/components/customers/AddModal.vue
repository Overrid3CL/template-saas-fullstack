<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  name: z.string().min(2, 'Muy corto'),
  email: z.string().email('Correo invalido')
})
const open = ref(false)

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: '',
  email: ''
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({ title: 'Listo', description: `Se agrego el nuevo cliente ${event.data.name}`, color: 'success' })
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" title="Nuevo cliente" description="Agregar un nuevo cliente a la base de datos">
    <UButton label="Nuevo cliente" icon="i-lucide-plus" />

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Nombre" placeholder="Juan Perez" name="name">
          <UInput v-model="state.name" class="w-full" />
        </UFormField>
        <UFormField label="Correo" placeholder="juan.perez@ejemplo.com" name="email">
          <UInput v-model="state.email" class="w-full" />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancelar"
            color="neutral"
            variant="subtle"
            @click="open = false"
          />
          <UButton
            label="Crear"
            color="primary"
            variant="solid"
            type="submit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

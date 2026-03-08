<script setup lang="ts">
import type { AuthFormField, FormError, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

type ForgotPasswordForm = {
  email: string
}

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Correo',
  placeholder: 'tu@email.com',
  required: true
}]

function validate(state: Partial<ForgotPasswordForm>): FormError<string>[] {
  const errors: FormError<string>[] = []

  if (!state.email?.trim()) {
    errors.push({ name: 'email', message: 'El email es obligatorio' })
  } else if (!/^\S+@\S+\.\S+$/.test(state.email)) {
    errors.push({ name: 'email', message: 'Ingresa un email valido' })
  }

  return errors
}

async function onSubmit(payload: FormSubmitEvent<ForgotPasswordForm>) {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // TODO: conectar con flujo real de recuperacion.
    await new Promise(resolve => setTimeout(resolve, 600))
    successMessage.value = `Si existe una cuenta para ${payload.data.email}, recibiras instrucciones por correo.`
  } catch {
    errorMessage.value = 'No se pudo iniciar la recuperacion. Intentalo nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UPageCard>
    <UAuthForm
      title="Recuperar contrasena"
      description="Te enviaremos instrucciones para restablecer tu acceso."
      icon="i-lucide-mail"
      :fields="fields"
      :validate="validate"
      :loading="loading"
      :submit="{ label: 'Enviar enlace', block: true }"
      @submit="onSubmit"
    >
      <template #description>
        Recordaste tu contrasena?
        <ULink
          to="/auth"
          class="text-primary font-medium"
        >
          Volver al login
        </ULink>.
      </template>

      <template #validation>
        <div class="space-y-3">
          <UAlert
            v-if="errorMessage"
            color="error"
            icon="i-lucide-circle-alert"
            :title="errorMessage"
          />
          <UAlert
            v-if="successMessage"
            color="success"
            icon="i-lucide-circle-check"
            :title="successMessage"
          />
        </div>
      </template>
    </UAuthForm>
  </UPageCard>
</template>

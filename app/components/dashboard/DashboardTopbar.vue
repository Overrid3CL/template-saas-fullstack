<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  userEmail?: string
}>()

const emit = defineEmits<{
  openMenu: []
  signOut: []
}>()

const accountItems = computed(() => [[
  {
    label: props.userEmail || 'Cuenta activa',
    disabled: true
  },
  {
    type: 'separator'
  },
  {
    label: 'Cerrar sesion',
    icon: 'i-lucide-log-out',
    onSelect: () => emit('signOut')
  }
]])
</script>

<template>
  <header class="h-16 border-b border-default bg-default/80 backdrop-blur px-4 md:px-6 flex items-center justify-between gap-4">
    <div class="min-w-0 flex items-center gap-3">
      <UButton
        icon="i-lucide-panel-left"
        color="neutral"
        variant="ghost"
        class="lg:hidden"
        aria-label="Abrir menu lateral"
        @click="emit('openMenu')"
      />

      <div class="min-w-0">
        <p class="text-sm md:text-base font-semibold text-highlighted truncate">
          {{ title }}
        </p>
        <p v-if="description" class="text-xs text-muted truncate">
          {{ description }}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <UColorModeButton />

      <UDropdownMenu
        :items="accountItems"
        :content="{ align: 'end' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-user-round"
          aria-label="Menu de cuenta"
        />
      </UDropdownMenu>
    </div>
  </header>
</template>

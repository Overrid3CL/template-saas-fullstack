<script setup lang="ts">
import { dashboardNavSections } from '~~/app/constants/dashboard-nav'

const props = withDefaults(defineProps<{
  currentPath: string
}>(), {})

const emit = defineEmits<{
  navigate: []
}>()

function isItemActive(itemPath: string, exact = false) {
  if (exact) {
    return props.currentPath === itemPath
  }

  return props.currentPath === itemPath || props.currentPath.startsWith(`${itemPath}/`)
}
</script>

<template>
  <aside class="h-full bg-elevated/40 border-r border-default">
    <div class="h-full flex flex-col">
      <div class="h-16 px-4 flex items-center border-b border-default">
        <NuxtLink to="/dashboard" class="inline-flex items-center gap-2" @click="emit('navigate')">
          <AppLogo class="h-6 w-auto shrink-0" />
          <span class="text-sm font-semibold text-highlighted">App de Mantenimiento</span>
        </NuxtLink>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <section v-for="section in dashboardNavSections" :key="section.label" class="space-y-2">
          <p class="px-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {{ section.label }}
          </p>

          <ul class="space-y-1">
            <li v-for="item in section.items" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="w-full h-10 px-3 rounded-md text-sm transition-colors flex items-center text-muted hover:text-highlighted hover:bg-elevated/80"
                :class="isItemActive(item.to, item.exact) ? 'bg-primary/10 text-primary font-medium' : ''"
                @click="emit('navigate')"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </section>
      </nav>
    </div>
  </aside>
</template>

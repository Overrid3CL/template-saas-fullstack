<script setup lang="ts">
import { authClient } from '~~/lib/auth-client'
import { findDashboardNavItemByPath } from '~~/app/constants/dashboard-nav'

const route = useRoute()
const isMobileSidebarOpen = ref(false)
const { data: session, refresh } = await authClient.useSession(useFetch)

const activeNavItem = computed(() => findDashboardNavItemByPath(route.path))
const title = computed(() => activeNavItem.value?.label || 'Dashboard')
const description = computed(() => activeNavItem.value?.description || 'Panel principal')

function toggleMobileSidebar() {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

function closeMobileSidebar() {
  isMobileSidebarOpen.value = false
}

async function signOut() {
  await authClient.signOut()
  await refresh()
  await navigateTo('/auth')
}

watch(() => route.fullPath, () => {
  closeMobileSidebar()
})
</script>

<template>
  <div class="min-h-screen bg-default text-default">
    <div class="flex min-h-screen">
      <div class="hidden lg:block w-72 shrink-0">
        <DashboardSidebar :current-path="route.path" />
      </div>

      <div class="min-w-0 flex-1 flex flex-col">
        <DashboardTopbar
          :title="title"
          :description="description"
          :user-email="session?.user?.email"
          @open-menu="toggleMobileSidebar"
          @sign-out="signOut"
        />

        <UMain class="flex-1">
          <UContainer class="py-6 md:py-8">
            <slot />
          </UContainer>
        </UMain>
      </div>
    </div>

    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-40 lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      <button
        class="absolute inset-0 bg-black/40"
        aria-label="Cerrar menu lateral"
        @click="closeMobileSidebar"
      />

      <div class="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-default shadow-xl">
        <DashboardSidebar :current-path="route.path" @navigate="closeMobileSidebar" />
      </div>
    </div>
  </div>
</template>

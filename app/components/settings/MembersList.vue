<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { MemberDto } from '~/types/settings'

const props = defineProps<{
  members: MemberDto[]
}>()

const emit = defineEmits<{
  roleChange: [memberId: string, role: 'member' | 'owner']
  remove: [memberId: string]
}>()

function actionItems(memberId: string): DropdownMenuItem[] {
  return [{
    label: 'Quitar miembro',
    color: 'error',
    onSelect: () => emit('remove', memberId)
  }]
}

void props
</script>

<template>
  <ul role="list" class="divide-y divide-default">
    <li
      v-for="member in members"
      :key="member.id"
      class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6"
    >
      <div class="flex items-center gap-3 min-w-0">
        <UAvatar
          v-bind="member.avatar"
          size="md"
        />

        <div class="text-sm min-w-0">
          <p class="text-highlighted font-medium truncate">
            {{ member.name }}
          </p>
          <p class="text-muted truncate">
            {{ member.username }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <USelect
          :model-value="member.role"
          :items="[
            { label: 'Miembro', value: 'member' },
            { label: 'Propietario', value: 'owner' }
          ]"
          color="neutral"
          :ui="{ item: 'capitalize' }"
          @update:model-value="emit('roleChange', member.id, $event as 'member' | 'owner')"
        />

        <UDropdownMenu :items="actionItems(member.id)" :content="{ align: 'end' }">
          <UButton
            icon="i-lucide-ellipsis-vertical"
            color="neutral"
            variant="ghost"
          />
        </UDropdownMenu>
      </div>
    </li>
  </ul>
</template>

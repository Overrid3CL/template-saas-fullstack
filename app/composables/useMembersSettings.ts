import type {
  ApiSuccess,
  MemberDto,
  InviteMemberInput,
  ChangeMemberRoleInput
} from '~/types/settings'

async function unwrap<T>(promise: Promise<ApiSuccess<T>>) {
  const response = await promise
  return response.data
}

export function useMembersSettings() {
  const members = useState<MemberDto[]>('settings:members', () => [])
  const loading = useState<boolean>('settings:members:loading', () => false)

  async function refreshMembers() {
    loading.value = true
    try {
      members.value = await unwrap($fetch<ApiSuccess<MemberDto[]>>('/api/members'))
      return members.value
    } finally {
      loading.value = false
    }
  }

  async function changeMemberRole(memberId: string, input: ChangeMemberRoleInput) {
    const updated = await unwrap($fetch<ApiSuccess<MemberDto>>(`/api/members/${memberId}/role`, {
      method: 'PATCH',
      body: input
    }))
    members.value = members.value.map(member => member.id === memberId ? updated : member)
    return updated
  }

  async function removeMember(memberId: string) {
    await unwrap($fetch<ApiSuccess<{ removed: boolean }>>(`/api/members/${memberId}`, {
      method: 'DELETE'
    }))
    members.value = members.value.filter(member => member.id !== memberId)
  }

  async function inviteMember(input: InviteMemberInput) {
    await unwrap($fetch<ApiSuccess<{
      id: string
      email: string
      role: string
      status: string
      expiresAt: string
    }>>('/api/members/invitations', {
      method: 'POST',
      body: input
    }))
  }

  return {
    members,
    loading,
    refreshMembers,
    changeMemberRole,
    removeMember,
    inviteMember
  }
}

import { BaseTenantRepository, type TenantScopedEntity } from './base/base-tenant-repository'

export type CustomerStatus = 'subscribed' | 'unsubscribed' | 'bounced'

export type CustomerRecord = TenantScopedEntity & {
  id: number
  name: string
  email: string
  avatar?: { src: string }
  status: CustomerStatus
  location: string
}

type CustomerWhere = {
  organizationId: string
  id?: number
  email?: string
}

type CustomerCreateInput = Omit<CustomerRecord, 'id' | 'organizationId'>
type CustomerUpdateInput = Partial<Omit<CustomerRecord, 'id' | 'organizationId'>>

const baseCustomers: Omit<CustomerRecord, 'id' | 'organizationId'>[] = [
  { name: 'Alex Smith', email: 'alex.smith@example.com', avatar: { src: 'https://i.pravatar.cc/128?u=1' }, status: 'subscribed', location: 'New York, USA' },
  { name: 'Jordan Brown', email: 'jordan.brown@example.com', avatar: { src: 'https://i.pravatar.cc/128?u=2' }, status: 'unsubscribed', location: 'London, UK' },
  { name: 'Taylor Green', email: 'taylor.green@example.com', avatar: { src: 'https://i.pravatar.cc/128?u=3' }, status: 'bounced', location: 'Paris, France' },
  { name: 'Morgan White', email: 'morgan.white@example.com', avatar: { src: 'https://i.pravatar.cc/128?u=4' }, status: 'subscribed', location: 'Berlin, Germany' },
  { name: 'Casey Gray', email: 'casey.gray@example.com', avatar: { src: 'https://i.pravatar.cc/128?u=5' }, status: 'subscribed', location: 'Tokyo, Japan' },
  { name: 'Jamie Johnson', email: 'jamie.johnson@example.com', avatar: { src: 'https://i.pravatar.cc/128?u=6' }, status: 'subscribed', location: 'Sydney, Australia' },
  { name: 'Riley Davis', email: 'riley.davis@example.com', avatar: { src: 'https://i.pravatar.cc/128?u=7' }, status: 'subscribed', location: 'New York, USA' },
  { name: 'Kelly Wilson', email: 'kelly.wilson@example.com', avatar: { src: 'https://i.pravatar.cc/128?u=8' }, status: 'subscribed', location: 'London, UK' },
  { name: 'Drew Moore', email: 'drew.moore@example.com', avatar: { src: 'https://i.pravatar.cc/128?u=9' }, status: 'bounced', location: 'Paris, France' },
  { name: 'Jordan Taylor', email: 'jordan.taylor@example.com', avatar: { src: 'https://i.pravatar.cc/128?u=10' }, status: 'subscribed', location: 'Berlin, Germany' }
]

const dataByOrganization = new Map<string, CustomerRecord[]>()

function getOrgSeed(organizationId: string) {
  return organizationId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

function ensureOrgDataset(organizationId: string) {
  const existing = dataByOrganization.get(organizationId)
  if (existing) {
    return existing
  }

  const seed = getOrgSeed(organizationId)
  const dataset = baseCustomers.map((customer, index) => ({
    ...customer,
    id: seed + index + 1,
    organizationId
  }))

  dataByOrganization.set(organizationId, dataset)
  return dataset
}

export class CustomerRepository extends BaseTenantRepository<
  CustomerRecord,
  CustomerWhere,
  CustomerCreateInput,
  CustomerUpdateInput
> {
  constructor(organizationId: string) {
    super(organizationId, {
      findMany: async (where) => {
        let rows = ensureOrgDataset(where.organizationId)

        if (where.id !== undefined) {
          rows = rows.filter(row => row.id === where.id)
        }

        if (where.email) {
          rows = rows.filter(row => row.email === where.email)
        }

        return rows
      },
      findFirst: async (where) => {
        const rows = ensureOrgDataset(where.organizationId)
        const first = rows.find((row) => {
          if (where.id !== undefined && row.id !== where.id) {
            return false
          }
          if (where.email && row.email !== where.email) {
            return false
          }
          return true
        })

        return first ?? null
      },
      create: async (data) => {
        const rows = ensureOrgDataset(data.organizationId)
        const nextId = rows.length > 0
          ? Math.max(...rows.map(row => row.id)) + 1
          : 1
        const created: CustomerRecord = { ...data, id: nextId }
        rows.push(created)
        return created
      },
      update: async (where, data) => {
        const rows = ensureOrgDataset(where.organizationId)
        const target = rows.find(row => row.id === where.id)

        if (!target) {
          throw new Error('CUSTOMER_NOT_FOUND')
        }

        Object.assign(target, data)
        return target
      },
      delete: async (where) => {
        const rows = ensureOrgDataset(where.organizationId)
        const index = rows.findIndex(row => row.id === where.id)

        if (index < 0) {
          throw new Error('CUSTOMER_NOT_FOUND')
        }

        const [deleted] = rows.splice(index, 1)
        if (!deleted) {
          throw new Error('CUSTOMER_NOT_FOUND')
        }
        return deleted
      }
    })
  }

  list() {
    return this.findMany()
  }
}

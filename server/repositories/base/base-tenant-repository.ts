export type TenantScopedEntity = {
  organizationId: string
}

type RecordLike = Record<string, unknown>

type TenantOperations<TEntity extends TenantScopedEntity, TWhere extends RecordLike, TCreate extends RecordLike, TUpdate extends RecordLike> = {
  findMany: (where: TWhere) => Promise<TEntity[]>
  findFirst: (where: TWhere) => Promise<TEntity | null>
  create: (data: TCreate & { organizationId: string }) => Promise<TEntity>
  update: (where: TWhere, data: TUpdate) => Promise<TEntity>
  delete: (where: TWhere) => Promise<TEntity>
}

export class BaseTenantRepository<
  TEntity extends TenantScopedEntity,
  TWhere extends RecordLike,
  TCreate extends RecordLike,
  TUpdate extends RecordLike
> {
  constructor(
    private readonly organizationId: string,
    private readonly operations: TenantOperations<TEntity, TWhere, TCreate, TUpdate>
  ) {}

  protected withTenantWhere(where?: Partial<TWhere>): TWhere {
    return {
      ...(where ?? {}),
      organizationId: this.organizationId
    } as unknown as TWhere
  }

  protected withTenantData<TData extends RecordLike>(data: TData): TData & { organizationId: string } {
    return {
      ...data,
      organizationId: this.organizationId
    }
  }

  async findMany(where?: Partial<TWhere>) {
    return this.operations.findMany(this.withTenantWhere(where))
  }

  async findFirst(where?: Partial<TWhere>) {
    return this.operations.findFirst(this.withTenantWhere(where))
  }

  async create(data: TCreate) {
    return this.operations.create(this.withTenantData(data))
  }

  async update(where: Partial<TWhere>, data: TUpdate) {
    return this.operations.update(this.withTenantWhere(where), data)
  }

  async delete(where: Partial<TWhere>) {
    return this.operations.delete(this.withTenantWhere(where))
  }
}

import { CustomerRepository } from '../repositories/customer.repository'

export class CustomerService {
  private readonly repository: CustomerRepository

  constructor(private readonly organizationId: string) {
    this.repository = new CustomerRepository(organizationId)
  }

  async list() {
    return this.repository.list()
  }
}

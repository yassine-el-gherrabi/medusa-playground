import { sdk } from "@/lib/sdk"
import type { Customer } from "@/types"

export async function getCustomer(): Promise<Customer | null> {
  try {
    const { customer } = await sdk.store.customer.retrieve()
    return customer as Customer
  } catch {
    return null
  }
}

export async function login(
  email: string,
  password: string
): Promise<void> {
  await sdk.auth.login("customer", "emailpass", {
    email,
    password,
  })
}

export async function register(data: {
  email: string
  password: string
  first_name: string
  last_name: string
}): Promise<void> {
  const token = await sdk.auth.register("customer", "emailpass", {
    email: data.email,
    password: data.password,
  })

  if (token) {
    await sdk.store.customer.create({
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
    })
  }
}

export async function logout(): Promise<void> {
  await sdk.auth.logout()
}

export async function updateCustomer(
  data: { first_name?: string; last_name?: string; phone?: string }
): Promise<Customer> {
  const { customer } = await sdk.store.customer.update(data)
  return customer as Customer
}

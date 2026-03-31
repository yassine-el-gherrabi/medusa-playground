"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"
import { sdk } from "@/lib/sdk"

type Customer = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  addresses?: any[]
}

type AuthContextType = {
  customer: Customer | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { first_name: string; last_name: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  setCustomer: (customer: Customer) => void
  refreshCustomer: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  customer: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  setCustomer: () => {},
  refreshCustomer: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshCustomer = useCallback(async () => {
    try {
      const { customer } = await sdk.store.customer.retrieve()
      setCustomer(customer as Customer)
    } catch {
      setCustomer(null)
    }
  }, [])

  useEffect(() => {
    refreshCustomer().finally(() => setLoading(false))
  }, [refreshCustomer])

  const login = useCallback(async (email: string, password: string) => {
    const token = await sdk.auth.login("customer", "emailpass", {
      email,
      password,
    })

    if (typeof token !== "string") {
      throw new Error("L'authentification necessite des etapes supplementaires non supportees.")
    }

    const { customer } = await sdk.store.customer.retrieve()
    setCustomer(customer as Customer)
  }, [])

  const register = useCallback(
    async (data: { first_name: string; last_name: string; email: string; password: string }) => {
      try {
        await sdk.auth.register("customer", "emailpass", {
          email: data.email,
          password: data.password,
        })
      } catch (error: any) {
        if (
          error?.statusText !== "Unauthorized" ||
          error?.message !== "Identity with email already exists"
        ) {
          throw error
        }
        const loginResponse = await sdk.auth.login("customer", "emailpass", {
          email: data.email,
          password: data.password,
        })
        if (typeof loginResponse !== "string") {
          throw new Error("L'authentification necessite des etapes supplementaires non supportees.")
        }
      }

      const { customer } = await sdk.store.customer.create({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
      })
      setCustomer(customer as Customer)
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await sdk.auth.logout()
    } catch {
      // ignore
    }
    setCustomer(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ customer, loading, login, register, logout, setCustomer, refreshCustomer }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

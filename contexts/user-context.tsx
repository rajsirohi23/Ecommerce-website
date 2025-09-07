"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { User } from "@/lib/types"

interface UserContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | null>(null)

// Mock user for demo purposes
const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  avatar: "/diverse-user-avatars.png",
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setUser(mockUser)
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
  }

  return <UserContext.Provider value={{ user, login, logout, isLoading }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

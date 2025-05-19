// use-auth.ts
import { useEffect, useState } from "react"

interface User {
  id: string
  name: string
  role: string
  email: string
  employeeProfile?: {
    firstName: string
    lastName: string
    employeeCode: string
    position?: string
    nickname?: string
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    async function fetchUser() {
      try {        const response = await fetch('/api/auth/me', {
          credentials: 'include' // This is important for cookies
        });
        
        if (!response.ok) {
          throw new Error('Authentication failed');
        }
          const { user: userData } = await response.json();
        setUser({
          id: userData.id,
          name: userData.name || userData.email,
          email: userData.email,
          role: userData.role,
          employeeProfile: userData.employeeProfile ? {
            firstName: userData.employeeProfile.firstName,
            lastName: userData.employeeProfile.lastName,
            employeeCode: userData.employeeProfile.employeeCode,
            position: userData.employeeProfile.position,
            nickname: userData.employeeProfile.nickname
          } : undefined
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [])

  return { user, isLoading }
}

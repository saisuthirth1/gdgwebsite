"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/app/firebase/config" // Corrected import path

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // No user is signed in, redirect to login
        router.push("/login")
      }
      setIsLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [router])

  // Render nothing while checking auth state
  if (isLoading) {
    return null
  }

  return <>{children}</>
}

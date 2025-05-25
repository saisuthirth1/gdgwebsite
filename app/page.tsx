"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Home() {
  const router = useRouter()

  return (
    <div className="relative">
      <div className="fixed inset-0 w-full h-full bg-[url('/backgroundimage.jpeg')] bg-cover bg-top bg-no-repeat -z-10 brightness-[0.85] after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-b after:from-black/50 after:to-black/20" />
      <div className="min-h-screen flex flex-col relative">
        <header className="sticky top-0 z-10 bg-gradient-to-b from-background/95 to-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border-b border-white/10">
          <div className="container flex h-20 items-center justify-between py-4">
            <div className="flex items-center gap-5 -ml-20">
              <Image src="/mainlogo-removebg-preview.png" alt="Logo" width={300} height={160} className="hover:opacity-90 transition-opacity" />
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push("/login")} 
              className="bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30 transition-all duration-300"
            >
              Login
            </Button>
          </div>
        </header>

        <main className="flex-1 container py-40">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/80 animate-gradient">
                Secure Digital Voting Platform
              </h1>
              <p className="text-2xl text-white/90 leading-relaxed">
                Welcome to our advanced voting verification system. Ensuring integrity and transparency in every vote.
              </p>
            </div>
            <div className="flex justify-center gap-8">
              <Button 
                size="lg" 
                onClick={() => router.push("/login")} 
                className="bg-primary hover:bg-primary/90 text-base px-8 py-5 h-auto transition-all duration-300 shadow-lg hover:shadow-primary/20 hover:scale-105"
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-base px-8 py-5 h-auto transition-all duration-300 shadow-lg hover:shadow-primary/20 hover:scale-105"
              >
                Learn More
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}



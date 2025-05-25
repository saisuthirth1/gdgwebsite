"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, onSnapshot } from "firebase/firestore"
import { db, auth } from "@/app/firebase/config" // Adjust the import path to your firebase config file
import { AlertTriangle, BarChart, Clock, Fingerprint, Mic, Shield, Users } from "lucide-react"
import Link from "next/link"
import { indianNames } from "@/lib/names"
import { AuthWrapper } from "@/components/auth-wrapper"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import { StatCard } from "@/components/stat-card"
import { VotingChart } from "@/components/voting-chart"
import { VoterDetailDialog } from "@/components/voter-detail-dialog"
import { ConstitutionListDialog } from "@/components/constitution-list-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const router = useRouter()
  const [showConstitutionList, setShowConstitutionList] = useState(false)
  const [recentNames, setRecentNames] = useState<string[]>([])
  const [selectedVoter, setSelectedVoter] = useState<{
    id: number
    name: string
    voterId: string
    verificationStatus: string
    verificationTime: Date
    manualCheckReason?: string
    boothNumber: number
    aadhaarLastDigits: string
  } | null>(null)
  const [totalVoters, setTotalVoters] = useState(0)
  const [verifiedVoters, setVerifiedVoters] = useState(0)
  const [manualChecks, setManualChecks] = useState(0)

  // Initialize hourlyVotes with all zeros
  const [hourlyVotes, setHourlyVotes] = useState<number[]>(() => Array(24).fill(0))

  // Load and save hourlyVotes to Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = user.uid
        const votesDocRef = doc(db, `users/${userId}/votingData/hourlyVotes`)

        // Check if it's a new day
        const lastLoginDate = localStorage.getItem('lastLoginDate')
        const today = new Date().toDateString()

        if (lastLoginDate !== today) {
          // Reset votes for new day
          const resetVotes = Array(24).fill(0)
          setHourlyVotes(resetVotes)
          setTotalVoters(0)
          setVerifiedVoters(0)
          setManualChecks(0)
          localStorage.setItem('lastLoginDate', today)
          
          // Save reset data to Firestore
          setDoc(votesDocRef, { 
            votes: resetVotes,
            totalVoters: 0,
            verifiedVoters: 0,
            manualChecks: 0,
            lastUpdate: today
          })
        } else {
          // Load existing data
          onSnapshot(votesDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data()
              setHourlyVotes(data.votes || Array(24).fill(0))
              setTotalVoters(data.totalVoters || 0)
              setVerifiedVoters(data.verifiedVoters || 0)
              setManualChecks(data.manualChecks || 0)
            }
          })
        }
      } else {
        router.push("/login")
      }
    })

    return () => unsubscribeAuth()
  }, [])

  useEffect(() => {
    const names = Array(5).fill(null).map((_, index) => {
      const stableIndex = index % indianNames.length
      return indianNames[stableIndex]
    })
    setRecentNames(names)
  }, [])

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push("/login")
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  const handleStartVerification = async () => {
    const currentHour = new Date().getHours()
    const increment = 1 // Changed to fixed increment of 1
  
    const newVotes = [...hourlyVotes]
    newVotes[currentHour] = (newVotes[currentHour] || 0) + increment
  
    const newTotalVoters = totalVoters + increment
    const newVerifiedVoters = verifiedVoters + 1 // Assuming each verification is successful
    const newManualChecks = manualChecks // No manual checks for simplicity, adjust if needed
  
    // Update Firestore first
    const user = auth.currentUser
    if (user) {
      const votesDocRef = doc(db, `users/${user.uid}/votingData/hourlyVotes`)
      await setDoc(votesDocRef, {
        votes: newVotes,
        totalVoters: newTotalVoters,
        verifiedVoters: newVerifiedVoters,
        manualChecks: newManualChecks,
        lastUpdate: new Date().toDateString()
      }, { merge: true })
    }
  
    // Then update local state
    setHourlyVotes(newVotes)
    setTotalVoters(newTotalVoters)
    setVerifiedVoters(newVerifiedVoters)
    setManualChecks(newManualChecks)
  
    // Wait a bit longer before redirecting
    setTimeout(() => {
      router.push("/verify")
    }, 1000)
  }

  return (
    <AuthWrapper>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <h1 className="text-2xl font-bold">Voting Verification System</h1>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <ThemeToggle />
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 container py-6">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">Monitor verification statistics and manage voter verification</p>
            </div>
            <Button variant="outline" onClick={() => setShowConstitutionList(true)} className="bg-black text-white hover:bg-black/90">
              Original Constitution List
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Voters"
              value={totalVoters.toString()}
              description="Processed today"
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              title="Verified Voters"
              value={verifiedVoters.toString()}
              description={`${Math.round((verifiedVoters / totalVoters) * 100) || 0}% success rate`}
              icon={<Fingerprint className="h-5 w-5" />}
              positive
            />
            <StatCard
              title="Manual Checks"
              value={manualChecks.toString()}
              description={`${Math.round((manualChecks / totalVoters) * 100) || 0}% of total voters`}
              icon={<Mic className="h-5 w-5" />}
              negative
            />
            <StatCard
              title="Average Time"
              value="1m 24s"
              description="Per verification"
              icon={<Clock className="h-5 w-5" />}
            />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Hourly Voting Patterns</CardTitle>
                  <CardDescription>Voter turnout from 9 AM to 6 PM</CardDescription>
                </div>
                <BarChart className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <VotingChart hourlyVotes={hourlyVotes} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Verifications</CardTitle>
                  <CardDescription>Last 5 voter verifications</CardDescription>
                </div>
                <Link href="/voters">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{recentNames[i] || "Loading..."}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(Date.now() - i * 5 * 60000).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            i === 2 ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {i === 2 ? "Manual Check" : "Verified"}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            const verificationDate = new Date(Date.now() - i * 5 * 60000)
                            setSelectedVoter({
                              id: 1248 - i,
                              name: recentNames[i] || "Loading...",
                              voterId: `V${1248 - i}`,
                              verificationStatus: i === 2 ? "manual_check" : "verified",
                              verificationTime: verificationDate,
                              manualCheckReason: i === 2 ? "Fingerprint mismatch" : undefined,
                              boothNumber: Math.floor(Math.random() * 10) + 1,
                              aadhaarLastDigits: Math.floor(Math.random() * 10000).toString().padStart(4, "0"),
                            })
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Fraud Detection</CardTitle>
                  <CardDescription>Unusual verification patterns</CardDescription>
                </div>
                <Link href="/fraud-detection">
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="font-medium">Multiple Failed Attempts</p>
                        <p className="text-xs text-muted-foreground">Booth #2</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">Critical</div>
                  </div>

                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <div>
                        <p className="font-medium">Sequential Voter IDs</p>
                        <p className="text-xs text-muted-foreground">East Zone</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">Medium</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-medium">System Status</p>
                        <p className="text-xs text-muted-foreground">All systems normal</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Secure</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <ConstitutionListDialog isOpen={showConstitutionList} onClose={() => setShowConstitutionList(false)} />
          <div className="mt-8 flex flex-wrap gap-2">
            <Button size="lg" onClick={handleStartVerification}>
              Start New Verification
            </Button>
            <Link href="/voters">
              <Button size="lg" variant="outline">
                View Voter List
              </Button>
            </Link>
            <Link href="/fraud-detection">
              <Button size="lg" variant="outline" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Fraud Detection
              </Button>
            </Link>
          </div>
        </main>

        <VoterDetailDialog
          isOpen={selectedVoter !== null}
          onClose={() => setSelectedVoter(null)}
          voter={selectedVoter}
        />
      </div>
    </AuthWrapper>
  )
}
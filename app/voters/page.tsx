"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowUpDown, CheckCircle, Clock, Download, Filter, Search, XCircle } from "lucide-react"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/app/firebase/config"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoterDetailDialog } from "@/components/voter-detail-dialog"

// Define voter interface
interface Voter {
  id: number
  name: string
  voterId: string
  verificationStatus: string
  verificationTime: Date
  manualCheckReason?: string
  boothNumber: number
  aadhaarLastDigits: string
}

export default function VotersPage() {
  const [voters, setVoters] = useState<Voter[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const user = auth.currentUser
        if (!user?.email) return

        const docRef = doc(db, "constitutionLists", user.email)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          const constitutionList = data.list || []
          
          // Transform constitution list entries to voter format
          const transformedVoters = constitutionList.map((entry: any, index: number) => ({
            id: index + 1,
            name: entry.name,
            voterId: `V${1000 + index}`,
            verificationStatus: Math.random() < 0.15 ? "manual_check" : "verified",
            verificationTime: new Date(Date.now() - Math.floor(Math.random() * 8 * 60 * 60 * 1000)),
            manualCheckReason: Math.random() < 0.15 ? [
              "Fingerprint mismatch",
              "Voice verification failed",
              "ID discrepancy",
              "Multiple verification attempts",
              "System error during verification",
            ][Math.floor(Math.random() * 5)] : "",
            boothNumber: Math.floor(Math.random() * 10) + 1,
            aadhaarLastDigits: entry.aadhaarNumber.slice(-4)
          }))

          setVoters(transformedVoters)
        }
      } catch (err) {
        console.error("Error fetching voters:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchVoters()
  }, [])

  // Filter voters based on search query and status filter
  const filteredVoters = voters.filter((voter) => {
    const matchesSearch =
      voter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voter.voterId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && voter.verificationStatus === "verified") ||
      (statusFilter === "manual_check" && voter.verificationStatus === "manual_check")

    return matchesSearch && matchesStatus
  })

  // Count voters by status
  const verifiedCount = voters.filter((v) => v.verificationStatus === "verified").length
  const manualCheckCount = voters.filter((v) => v.verificationStatus === "manual_check").length

  const handleViewVoter = (voter: Voter) => {
    setSelectedVoter(voter)
    setIsDetailDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDetailDialogOpen(false)
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading voters...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Dashboard</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Voter List</h1>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export List
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Voters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{voters.length}</div>
              <CardDescription>Processed today</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
              <CardDescription>{Math.round((verifiedCount / voters.length) * 100) || 0}% success rate</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Manual Check Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{manualCheckCount}</div>
              <CardDescription>{Math.round((manualCheckCount / voters.length) * 100) || 0}% of total voters</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or voter ID"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Voters</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="manual_check">Manual Check</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Voter ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Booth</TableHead>
                <TableHead>Aadhaar (Last 4)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVoters.map((voter) => (
                <TableRow 
                  key={voter.id}
                  className={voter.verificationStatus === "verified" ? "bg-green-50" : voter.verificationStatus === "manual_check" ? "bg-red-50" : ""}
                >
                  <TableCell>{voter.name}</TableCell>
                  <TableCell>{voter.voterId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {voter.verificationStatus === "verified" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      {voter.verificationStatus === "verified" ? "Verified" : "Manual Check"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {voter.verificationTime.toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>Booth {voter.boothNumber}</TableCell>
                  <TableCell>XXXX XXXX XXXX {voter.aadhaarLastDigits}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => handleViewVoter(voter)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      {selectedVoter && (
        <VoterDetailDialog
          voter={selectedVoter}
          isOpen={isDetailDialogOpen}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  )
}


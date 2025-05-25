"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, Clock, FileText, Search } from "lucide-react"
import Link from "next/link"
import { collection, onSnapshot } from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { db, auth } from "@/app/firebase/config"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Transaction {
  id: string
  hash: string
  timestamp: string
  status: "confirmed" | "pending"
  aadhaarNumber: string // Replaced voterId with aadhaarNumber
}

export default function BlockchainPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid)

        const transactionsRef = collection(db, `users/${user.uid}/transactions`)
        const unsubscribeSnapshot = onSnapshot(transactionsRef, (snapshot) => {
          const transactionsData: Transaction[] = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              hash: data.hash,
              timestamp: data.timestamp,
              status: data.status,
              aadhaarNumber: data.aadhaarNumber, // Replaced voterId with aadhaarNumber
            }
          })
          setTransactions(transactionsData)
        }, (error) => {
          console.error("Error fetching transactions from Firestore:", error)
        })

        return () => unsubscribeSnapshot()
      } else {
        setTransactions([])
      }
    })

    return () => unsubscribeAuth()
  }, [])

  const filteredTransactions = transactions.filter(
    (tx) => tx.hash.includes(searchQuery) || tx.aadhaarNumber.includes(searchQuery),
  )

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
            <h1 className="text-2xl font-bold">Blockchain Verification Records</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="mb-8">
          <p className="text-muted-foreground">View and verify all blockchain transactions for voter verification</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by transaction hash or Aadhaar number"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Verification Transactions</CardTitle>
                <CardDescription>Showing {filteredTransactions.length} transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.map((tx) => (
                    <div key={tx.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Transaction #{tx.hash.slice(0, 8)}</span>
                            {tx.status === "confirmed" ? (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                Confirmed
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="mt-1 break-all text-xs text-muted-foreground">{tx.hash}</p>
                        </div>
                        <div className="text-right text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </div>
                          <div className="mt-1 font-medium">Aadhaar Number: {tx.aadhaarNumber}</div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Verification successful</span>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="confirmed" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Confirmed Transactions</CardTitle>
                <CardDescription>
                  Showing {filteredTransactions.filter((tx) => tx.status === "confirmed").length} confirmed transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions
                    .filter((tx) => tx.status === "confirmed")
                    .map((tx) => (
                      <div key={tx.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Transaction #{tx.hash.slice(0, 8)}</span>
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                Confirmed
                              </span>
                            </div>
                            <p className="mt-1 break-all text-xs text-muted-foreground">{tx.hash}</p>
                          </div>
                          <div className="text-right text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(tx.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="mt-1 font-medium">Aadhaar Number: {tx.aadhaarNumber}</div>
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Verification successful</span>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Transactions</CardTitle>
                <CardDescription>
                  Showing {filteredTransactions.filter((tx) => tx.status === "pending").length} pending transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions
                    .filter((tx) => tx.status === "pending")
                    .map((tx) => (
                      <div key={tx.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Transaction #{tx.hash.slice(0, 8)}</span>
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                Pending
                              </span>
                            </div>
                            <p className="mt-1 break-all text-xs text-muted-foreground">{tx.hash}</p>
                          </div>
                          <div className="text-right text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(tx.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="mt-1 font-medium">Aadhaar Number: {tx.aadhaarNumber}</div>
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-amber-500" />
                            <span>Awaiting confirmation</span>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
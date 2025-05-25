"use client"

import { useState } from "react"
import { ArrowLeft, Calendar, Download, Filter, Info, AlertTriangle } from "lucide-react"
import { AnomalyVisualization } from "@/components/anomaly-visualization"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function FraudDetectionPage() {
  const [timeRange, setTimeRange] = useState("today")
  const [boothFilter, setBoothFilter] = useState("all")

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
            <h1 className="text-2xl font-bold">Fraud Detection System</h1>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="mb-8">
          <p className="text-muted-foreground">
            Monitor and detect unusual verification patterns and potential fraud attempts
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={boothFilter} onValueChange={setBoothFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by booth" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Booths</SelectItem>
                  <SelectItem value="1">Booth #1</SelectItem>
                  <SelectItem value="2">Booth #2</SelectItem>
                  <SelectItem value="3">Booth #3</SelectItem>
                  <SelectItem value="4">Booth #4</SelectItem>
                  <SelectItem value="5">Booth #5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Threat Level:</span>
            <div className="flex h-8 items-center gap-1 rounded-md border px-3">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">Low</span>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Multiple Attempts</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Voters with multiple verification attempts</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <CardDescription>3.2% of total verifications</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Biometric Mismatches</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Fingerprint or voice verification failures</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <CardDescription>7.5% of total verifications</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Unusual Patterns</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Suspicious verification patterns detected</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <CardDescription className="text-amber-500 font-medium">Requires investigation</CardDescription>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="heatmap">
          <TabsList>
            <TabsTrigger value="heatmap">Verification Heatmap</TabsTrigger>
            <TabsTrigger value="patterns">Unusual Patterns</TabsTrigger>
            <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="heatmap" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Attempt Heatmap</CardTitle>
                <CardDescription>Geographic distribution of verification attempts and failures</CardDescription>
              </CardHeader>
              <CardContent>
                <AnomalyVisualization
                  data={[
                    { x: 30, y: 40, intensity: 0.8, type: "multiple_attempt" },
                    { x: 60, y: 30, intensity: 0.6, type: "biometric_mismatch" },
                    { x: 45, y: 60, intensity: 0.4, type: "unusual_pattern" }
                  ]}
                />

                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-md border p-3">
                    <div className="text-sm font-medium text-muted-foreground">North Zone</div>
                    <div className="mt-1 text-lg font-bold">127 attempts</div>
                    <div className="text-xs text-green-500">Normal activity</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-sm font-medium text-muted-foreground">South Zone</div>
                    <div className="mt-1 text-lg font-bold">98 attempts</div>
                    <div className="text-xs text-green-500">Normal activity</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-sm font-medium text-muted-foreground">East Zone</div>
                    <div className="mt-1 text-lg font-bold">156 attempts</div>
                    <div className="text-xs text-amber-500">Higher than expected</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-sm font-medium text-muted-foreground">West Zone</div>
                    <div className="mt-1 text-lg font-bold">203 attempts</div>
                    <div className="text-xs text-red-500">Unusual activity</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="mt-6">
            <AnomalyVisualization
              patterns={[
                {
                  timestamp: Date.now(),
                  location: "West Zone",
                  deviceId: "A7F892",
                  verificationAttempts: 17,
                  voterIds: ["V1042", "V1043", "V1044", "V1045", "V1046"]
                },
                {
                  timestamp: Date.now() - 900000, // 15 minutes ago
                  location: "East Zone",
                  deviceId: "B2C456",
                  verificationAttempts: 8,
                  voterIds: ["V1047", "V1048", "V1049"]
                },
                {
                  timestamp: Date.now() - 1800000, // 30 minutes ago
                  location: "North Zone",
                  deviceId: "D9E123",
                  verificationAttempts: 12,
                  voterIds: ["V1050", "V1051", "V1052", "V1053"]
                }
              ]}
              onInvestigate={(pattern) => {
                console.log("Investigating pattern:", pattern);
                // TODO: Implement investigation dialog
              }}
            />
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Historical Patterns</CardTitle>
                <CardDescription>Previously detected patterns that may indicate organized fraud attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Multiple Verification Attempts from Same Device</h3>
                          <p className="text-sm text-muted-foreground">Booth #3 - West Zone</p>
                        </div>
                      </div>
                      <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                        High Risk
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm">
                        Device ID #A7F892 has been used for 17 verification attempts in the last hour, which is
                        significantly higher than the average of 5-7 per hour.
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Investigate
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500">
                          Block Device
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Sequential Voter IDs</h3>
                          <p className="text-sm text-muted-foreground">Multiple Booths - East Zone</p>
                        </div>
                      </div>
                      <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-600">
                        Medium Risk
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm">
                        Detected 8 verification attempts with sequential voter IDs (V1042-V1049) across different booths
                        within a 15-minute timeframe.
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Investigate
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Unusual Verification Time Pattern</h3>
                          <p className="text-sm text-muted-foreground">Booth #7 - North Zone</p>
                        </div>
                      </div>
                      <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-600">
                        Medium Risk
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm">
                        Detected an unusual pattern of verification attempts occurring exactly 3 minutes apart for 12
                        consecutive verifications.
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Investigate
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Fraud Alerts</CardTitle>
                <CardDescription>Current alerts requiring attention or investigation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Multiple Failed Biometric Attempts</h3>
                      <p className="text-sm text-muted-foreground">Booth #2 - South Zone</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">Critical</div>
                      <Button variant="outline" size="sm">
                        Investigate
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Suspicious Device Activity</h3>
                      <p className="text-sm text-muted-foreground">Booth #5 - West Zone</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-600">High</div>
                      <Button variant="outline" size="sm">
                        Investigate
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Info className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Unusual Verification Rate</h3>
                      <p className="text-sm text-muted-foreground">Booth #9 - East Zone</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">Medium</div>
                      <Button variant="outline" size="sm">
                        Investigate
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}


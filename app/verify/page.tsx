"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, ChevronRight, Fingerprint, Mic, RefreshCw, XCircle } from "lucide-react"
import { doc, setDoc } from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { db, auth } from "@/app/firebase/config"

import { LanguageSelector } from "@/components/language-selector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function VerifyPage() {
  const router = useRouter()
  const [step, setStep] = useState<"fingerprint" | "voice" | "complete">("fingerprint")
  const [fingerprintStatus, setFingerprintStatus] = useState<"idle" | "scanning" | "success" | "error">("idle")
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "recording" | "analyzing" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [transactionHash, setTransactionHash] = useState("")
  const [aadhaarNumber, setAadhaarNumber] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid)
      } else {
        router.push("/login")
      }
    })
    return () => unsubscribe()
  }, [router])

  const startFingerprintScan = () => {
    setFingerprintStatus("scanning")

    let scanProgress = 0
    const interval = setInterval(() => {
      scanProgress += 5
      setProgress(scanProgress)

      if (scanProgress >= 100) {
        clearInterval(interval)
        setFingerprintStatus("success")

        const hash = "0x889ce6f61e3017393f75c05d2111bfca74f0cb40a7a618d46110a930c3a5b945"
        setTransactionHash(hash)

        // Generate a 12-digit Aadhaar number (for demo purposes)
        const newAadhaarNumber = "123456789012" // In a real app, this would be fetched or input
        setAadhaarNumber(newAadhaarNumber)

        if (userId) {
          const transactionRef = doc(db, `users/${userId}/transactions`, hash)
          setDoc(transactionRef, {
            hash: hash,
            aadhaarNumber: newAadhaarNumber, // Replace voterId with aadhaarNumber
            timestamp: new Date().toISOString(),
            status: "confirmed",
          }).catch((error) => {
            console.error("Error saving transaction to Firestore:", error)
          })
        }

        setTimeout(() => {
          setStep("voice")
          setProgress(0)
        }, 1500)
      }
    }, 150)
  }

  const startVoiceVerification = () => {
    setVoiceStatus("recording")

    let recordProgress = 0
    const interval = setInterval(() => {
      recordProgress += 5
      setProgress(recordProgress)

      if (recordProgress >= 100) {
        clearInterval(interval)
        setVoiceStatus("analyzing")

        setTimeout(() => {
          if (Math.random() > 0.1) {
            setVoiceStatus("success")
            setTimeout(() => {
              setStep("complete")
            }, 1500)
          } else {
            setVoiceStatus("error")
          }
        }, 1500)
      }
    }, 150)
  }

  const retryVoiceVerification = () => {
    setVoiceStatus("idle")
    setProgress(0)
  }

  const completeVerification = () => {
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-2xl font-bold">Voter Verification</h1>
          <LanguageSelector />
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Verification Process</h2>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
            </div>
            <p className="mt-2 text-muted-foreground">Complete the following steps to verify the voter</p>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  step === "fingerprint" || step === "voice" || step === "complete"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <span className="font-medium">Fingerprint</span>
            </div>
            <Separator className="flex-1 mx-4" />
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  step === "voice" || step === "complete"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="font-medium">Voice</span>
            </div>
            <Separator className="flex-1 mx-4" />
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  step === "complete" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </div>
              <span className="font-medium">Complete</span>
            </div>
          </div>

          {step === "fingerprint" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  Fingerprint Verification
                </CardTitle>
                <CardDescription>Place the voter's finger on the scanner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
                  {fingerprintStatus === "idle" && (
                    <div className="text-center">
                      <Fingerprint className="mx-auto h-16 w-16 text-muted-foreground" />
                      <p className="mt-4 text-lg font-medium">Ready to Scan</p>
                      <p className="text-sm text-muted-foreground">Place the voter's right thumb on the scanner</p>
                    </div>
                  )}

                  {fingerprintStatus === "scanning" && (
                    <div className="text-center">
                      <Fingerprint className="mx-auto h-16 w-16 text-primary animate-pulse" />
                      <p className="mt-4 text-lg font-medium">Scanning...</p>
                      <Progress value={progress} className="mt-4 w-64" />
                    </div>
                  )}

                  {fingerprintStatus === "success" && (
                    <div className="text-center">
                      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                      <p className="mt-4 text-lg font-medium text-green-500">Fingerprint Verified</p>
                      <p className="text-sm text-muted-foreground">Proceeding to voice verification...</p>
                    </div>
                  )}

                  {fingerprintStatus === "error" && (
                    <div className="text-center">
                      <XCircle className="mx-auto h-16 w-16 text-red-500" />
                      <p className="mt-4 text-lg font-medium text-red-500">Verification Failed</p>
                      <p className="text-sm text-muted-foreground">
                        Please try again or proceed to manual verification
                      </p>
                    </div>
                  )}
                </div>

                {transactionHash && (
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-medium">Blockchain Transaction</p>
                    <p className="mt-1 break-all text-xs text-muted-foreground">{transactionHash}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Cancel
                </Button>
                <Button
                  onClick={startFingerprintScan}
                  disabled={fingerprintStatus === "scanning" || fingerprintStatus === "success"}
                >
                  {fingerprintStatus === "idle"
                    ? "Start Scan"
                    : fingerprintStatus === "scanning"
                      ? "Scanning..."
                      : fingerprintStatus === "success"
                        ? "Verified"
                        : "Retry Scan"}
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === "voice" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Voice Verification
                </CardTitle>
                <CardDescription>Ask the voter to read the phrase below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="hindi" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="hindi">Hindi</TabsTrigger>
                    <TabsTrigger value="english">English</TabsTrigger>
                    <TabsTrigger value="regional">Regional</TabsTrigger>
                  </TabsList>
                  <TabsContent value="hindi" className="mt-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-lg font-medium">"मैं अपने मताधिकार का प्रयोग करने के लिए यहां आया/आई हूं।"</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="english" className="mt-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-lg font-medium">"I am here to exercise my right to vote."</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="regional" className="mt-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-lg font-medium">"ನಾನು ಮತ ಚಲಾಯಿಸಲು ಇಲ್ಲಿ ಬಂದಿದ್ದೇನೆ."</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
                  {voiceStatus === "idle" && (
                    <div className="text-center">
                      <Mic className="mx-auto h-16 w-16 text-muted-foreground" />
                      <p className="mt-4 text-lg font-medium">Ready to Record</p>
                      <p className="text-sm text-muted-foreground">Ask the voter to read the phrase aloud</p>
                    </div>
                  )}

                  {voiceStatus === "recording" && (
                    <div className="text-center">
                      <Mic className="mx-auto h-16 w-16 text-primary animate-pulse" />
                      <p className="mt-4 text-lg font-medium">Recording...</p>
                      <Progress value={progress} className="mt-4 w-64" />
                    </div>
                  )}

                  {voiceStatus === "analyzing" && (
                    <div className="text-center">
                      <RefreshCw className="mx-auto h-16 w-16 text-primary animate-spin" />
                      <p className="mt-4 text-lg font-medium">Analyzing Voice Pattern...</p>
                    </div>
                  )}

                  {voiceStatus === "success" && (
                    <div className="text-center">
                      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                      <p className="mt-4 text-lg font-medium text-green-500">Voice Verified</p>
                      <p className="text-sm text-muted-foreground">Proceeding to completion...</p>
                    </div>
                  )}

                  {voiceStatus === "error" && (
                    <div className="text-center">
                      <XCircle className="mx-auto h-16 w-16 text-red-500" />
                      <p className="mt-4 text-lg font-medium text-red-500">Verification Failed</p>
                      <p className="text-sm text-muted-foreground">
                        Please try again or proceed to manual verification
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Cancel
                </Button>
                {voiceStatus === "error" ? (
                  <Button onClick={retryVoiceVerification}>Retry Voice Verification</Button>
                ) : (
                  <Button
                    onClick={startVoiceVerification}
                    disabled={voiceStatus === "recording" || voiceStatus === "analyzing" || voiceStatus === "success"}
                  >
                    {voiceStatus === "idle"
                      ? "Start Recording"
                      : voiceStatus === "recording"
                        ? "Recording..."
                        : voiceStatus === "analyzing"
                          ? "Analyzing..."
                          : voiceStatus === "success"
                            ? "Verified"
                            : "Retry"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}

          {step === "complete" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Verification Complete
                </CardTitle>
                <CardDescription>The voter has been successfully verified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-green-50 p-6 text-center">
                  <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                  <h3 className="mt-4 text-xl font-bold text-green-700">Verification Successful</h3>
                  <p className="mt-2 text-green-600">The voter is verified and can proceed to the voting booth</p>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">Verification Summary</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fingerprint Verification</span>
                      <span className="text-sm font-medium text-green-500">Passed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Voice Verification</span>
                      <span className="text-sm font-medium text-green-500">Passed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Blockchain Record</span>
                      <span className="text-sm font-medium text-green-500">Created</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">Blockchain Transaction</p>
                  <p className="mt-1 break-all text-xs text-muted-foreground">{transactionHash}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={completeVerification}>
                  Return to Dashboard <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
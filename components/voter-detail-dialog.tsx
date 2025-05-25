"use client"

import * as React from "react"
import { CheckCircle, Eye, EyeOff, ShieldCheck, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
// Import Firestore instance
import { db } from "@/app/firebase/config"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

interface VoterDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  voter: {
    id: number
    name: string
    voterId: string
    verificationStatus: string
    verificationTime: Date
    manualCheckReason?: string
    boothNumber: number
    aadhaarLastDigits: string
  } | null
}

export function VoterDetailDialog({ isOpen, onClose, voter }: VoterDetailDialogProps) {
  const [mounted, setMounted] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("details")

  // Verification officers state
  const [officerOne, setOfficerOne] = React.useState("")
  const [officerOnePass, setOfficerOnePass] = React.useState("")
  const [officerOneVerified, setOfficerOneVerified] = React.useState(false)
  
  const [officerTwo, setOfficerTwo] = React.useState("")
  const [officerTwoPass, setOfficerTwoPass] = React.useState("")
  const [officerTwoVerified, setOfficerTwoVerified] = React.useState(false)
  
  const [showOfficerOnePass, setShowOfficerOnePass] = React.useState(false)
  const [showOfficerTwoPass, setShowOfficerTwoPass] = React.useState(false)
  
  const [verificationNotes, setVerificationNotes] = React.useState("")
  const [verificationMethod, setVerificationMethod] = React.useState("id_documents")
  const [verificationProgress, setVerificationProgress] = React.useState(0)
  const [verificationComplete, setVerificationComplete] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [verificationAction, setVerificationAction] = React.useState<"approve" | "reject" | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Reset states when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab("details")
      setOfficerOne("")
      setOfficerOnePass("")
      setOfficerOneVerified(false)
      setOfficerTwo("")
      setOfficerTwoPass("")
      setOfficerTwoVerified(false)
      setVerificationNotes("")
      setVerificationMethod("id_documents")
      setVerificationProgress(0)
      setVerificationComplete(false)
      setVerificationAction(null)
      setError(null)
    }
  }, [isOpen])

  const verifyOfficerOne = () => {
    if (officerOne && officerOnePass) {
      // Simulate officer verification - in a real system this would call an authentication API
      setIsProcessing(true)
      setTimeout(() => {
        setOfficerOneVerified(true)
        setIsProcessing(false)
      }, 1000)
    }
  }

  const verifyOfficerTwo = () => {
    if (officerTwo && officerTwoPass) {
      // Verify officer two is different from officer one
      if (officerTwo === officerOne) {
        alert("Second verification officer must be different from the first officer")
        return
      }
      
      // Simulate officer verification
      setIsProcessing(true)
      setTimeout(() => {
        setOfficerTwoVerified(true)
        setIsProcessing(false)
      }, 1000)
    }
  }

  const saveToFirebase = async () => {
    if (!voter) return

    try {
      // Save verification details to Firestore
      await setDoc(doc(db, "voter_verifications", `${voter.id}`), {
        voterId: voter.id,
        voterName: voter.name,
        verificationStatus: verificationAction,
        verificationMethod: verificationMethod,
        verificationNotes: verificationNotes,
        officerOne: officerOne,
        officerTwo: officerTwo,
        timestamp: serverTimestamp(),
        boothNumber: voter.boothNumber,
        aadhaarLastDigits: voter.aadhaarLastDigits
      })
    } catch (err) {
      console.error("Error saving to Firebase:", err)
      setError("Failed to save verification details. Please try again.")
    }
  }

  const completeManualVerification = () => {
    if (!officerOneVerified || !officerTwoVerified) {
      alert("Both officers must verify this action")
      return
    }

    if (!verificationNotes) {
      alert("Please provide verification notes")
      return
    }

    if (!verificationAction) {
      alert("Please select whether to approve or reject the voter")
      return
    }

    // Simulate verification process with progress
    setIsProcessing(true)
    
    const interval = setInterval(() => {
      setVerificationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setVerificationComplete(true)
          setIsProcessing(false)
          // Save to Firebase when verification is complete
          saveToFirebase()
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  if (!mounted || !voter) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Voter Details</DialogTitle>
          <DialogDescription>
            {voter.verificationStatus === "manual_check" 
              ? "Manual verification required for " 
              : "Verification information for "}
            {voter.name}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Voter Details</TabsTrigger>
            <TabsTrigger 
              value="verification" 
              className={voter.verificationStatus === "manual_check" ? "text-red-600" : ""}
            >
              Manual Verification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Name:</span>
                <span className="col-span-2">{voter.name}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Voter ID:</span>
                <span className="col-span-2">{voter.voterId}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Aadhaar:</span>
                <span className="col-span-2">XXXX-XXXX-{voter.aadhaarLastDigits}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Booth:</span>
                <span className="col-span-2">Booth #{voter.boothNumber}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Verification Time:</span>
                <span className="col-span-2">{new Date(voter.verificationTime).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Status:</span>
                <span className="col-span-2">
                  {voter.verificationStatus === "verified" ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Manual Check Required</Badge>
                  )}
                </span>
              </div>
              {voter.verificationStatus === "manual_check" && voter.manualCheckReason && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium">Reason:</span>
                  <span className="col-span-2 text-red-600">{voter.manualCheckReason}</span>
                </div>
              )}
            </div>

            {voter.verificationStatus === "manual_check" && (
              <div className="mt-4">
                <Button 
                  onClick={() => setActiveTab("verification")} 
                  className="w-full" 
                  variant="destructive"
                >
                  Proceed to Manual Verification
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="verification">
            {verificationComplete ? (
              <div className="py-4 text-center">
                {verificationAction === "approve" ? (
                  <>
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-green-700">Verification Complete</h3>
                    <p className="text-green-600 mt-2">This voter has been manually verified and approved</p>
                  </>
                ) : (
                  <>
                    <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-red-700">Verification Rejected</h3>
                    <p className="text-red-600 mt-2">This voter has been manually verified and rejected</p>
                  </>
                )}
                
                <div className="mt-6 rounded-lg bg-green-50 p-4 text-left">
                  <h4 className="font-medium">Verification Summary</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Decision:</span>
                      <span className={verificationAction === "approve" ? "font-medium text-green-600" : "font-medium text-red-600"}>
                        {verificationAction === "approve" ? "Approved" : "Rejected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verification Method:</span>
                      <span className="font-medium">
                        {verificationMethod === "id_documents" ? "ID Documents" : 
                         verificationMethod === "biometric_override" ? "Biometric Override" : 
                         "Alternative Verification"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>First Officer:</span>
                      <span className="font-medium">{officerOne}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Second Officer:</span>
                      <span className="font-medium">{officerTwo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Timestamp:</span>
                      <span className="font-medium">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium">Notes:</h4>
                    <p className="mt-1 text-sm bg-white p-2 rounded border">{verificationNotes}</p>
                  </div>
                </div>
                
                <Button className="mt-6 w-full" onClick={onClose}>
                  Close
                </Button>
              </div>
            ) : (
              <div className="py-2">
                <div className={`p-4 rounded-lg mb-4 ${voter.verificationStatus === "manual_check" ? "bg-amber-50" : "bg-blue-50"}`}>
                  <h3 className={`font-medium ${voter.verificationStatus === "manual_check" ? "text-amber-800" : "text-blue-800"}`}>
                    {voter.verificationStatus === "manual_check" ? "Manual Verification Required" : "Manual Verification"}
                  </h3>
                  {voter.verificationStatus === "manual_check" ? (
                    <p className="text-sm text-amber-700 mt-1">
                      This voter requires manual verification due to: <span className="font-bold">{voter.manualCheckReason}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-blue-700 mt-1">
                      This voter was already verified automatically, but you can override the verification if needed.
                    </p>
                  )}
                  <p className="text-sm mt-2 font-medium">
                    Two election officers must verify this action.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-3">First Officer Verification</h3>
                    <div className="grid gap-3">
                      <div className="grid grid-cols-4 gap-2 items-center">
                        <Label htmlFor="officer1" className="col-span-1">Officer ID:</Label>
                        <div className="col-span-3 flex">
                          <Input 
                            id="officer1" 
                            value={officerOne}
                            onChange={(e) => setOfficerOne(e.target.value)}
                            disabled={officerOneVerified}
                            placeholder="Enter ID"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 items-center">
                        <Label htmlFor="officer1pass" className="col-span-1">Password:</Label>
                        <div className="col-span-3 flex">
                          <div className="relative w-full">
                            <Input 
                              id="officer1pass" 
                              type={showOfficerOnePass ? "text" : "password"}
                              value={officerOnePass}
                              onChange={(e) => setOfficerOnePass(e.target.value)}
                              disabled={officerOneVerified}
                              placeholder="Enter password"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              type="button"
                              onClick={() => setShowOfficerOnePass(!showOfficerOnePass)}
                              className="absolute right-0 top-0 h-full px-3"
                              disabled={officerOneVerified}
                            >
                              {showOfficerOnePass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {!officerOneVerified ? (
                        <Button 
                          onClick={verifyOfficerOne} 
                          disabled={!officerOne || !officerOnePass || isProcessing}
                          className="ml-auto"
                        >
                          Verify Officer 1
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 justify-end">
                          <CheckCircle size={16} />
                          <span className="text-sm font-medium">Officer 1 Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Second Officer Verification</h3>
                    <div className="grid gap-3">
                      <div className="grid grid-cols-4 gap-2 items-center">
                        <Label htmlFor="officer2" className="col-span-1">Officer ID:</Label>
                        <div className="col-span-3 flex">
                          <Input 
                            id="officer2" 
                            value={officerTwo}
                            onChange={(e) => setOfficerTwo(e.target.value)}
                            disabled={officerTwoVerified || !officerOneVerified}
                            placeholder="Enter ID"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 items-center">
                        <Label htmlFor="officer2pass" className="col-span-1">Password:</Label>
                        <div className="col-span-3 flex">
                          <div className="relative w-full">
                            <Input 
                              id="officer2pass" 
                              type={showOfficerTwoPass ? "text" : "password"}
                              value={officerTwoPass}
                              onChange={(e) => setOfficerTwoPass(e.target.value)}
                              disabled={officerTwoVerified || !officerOneVerified}
                              placeholder="Enter password"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              type="button"
                              onClick={() => setShowOfficerTwoPass(!showOfficerTwoPass)}
                              className="absolute right-0 top-0 h-full px-3"
                              disabled={officerTwoVerified || !officerOneVerified}
                            >
                              {showOfficerTwoPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {!officerTwoVerified ? (
                        <Button 
                          onClick={verifyOfficerTwo} 
                          disabled={!officerTwo || !officerTwoPass || !officerOneVerified || isProcessing}
                          className="ml-auto"
                        >
                          Verify Officer 2
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 justify-end">
                          <CheckCircle size={16} />
                          <span className="text-sm font-medium">Officer 2 Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {officerOneVerified && officerTwoVerified && (
                    <div className="border p-4 rounded-lg">
                      <h3 className="font-medium mb-3">Complete Verification</h3>
                      
                      <div className="grid gap-3">
                        <div className="grid grid-cols-4 gap-2 items-start">
                          <Label htmlFor="verificationMethod" className="col-span-1 mt-2">Method:</Label>
                          <div className="col-span-3">
                            <Select 
                              value={verificationMethod} 
                              onValueChange={setVerificationMethod}
                              disabled={isProcessing}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select verification method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="id_documents">ID Documents</SelectItem>
                                <SelectItem value="biometric_override">Biometric Override</SelectItem>
                                <SelectItem value="alternative">Alternative Verification</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 items-start">
                          <Label htmlFor="verificationAction" className="col-span-1 mt-2">Decision:</Label>
                          <div className="col-span-3">
                            <div className="flex gap-4">
                              <Button 
                                type="button" 
                                onClick={() => setVerificationAction("approve")}
                                variant={verificationAction === "approve" ? "default" : "outline"}
                                className={verificationAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
                                disabled={isProcessing}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button 
                                type="button" 
                                onClick={() => setVerificationAction("reject")}
                                variant={verificationAction === "reject" ? "destructive" : "outline"}
                                disabled={isProcessing}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 items-start">
                          <Label htmlFor="notes" className="col-span-1 mt-2">Notes:</Label>
                          <div className="col-span-3">
                            <Textarea 
                              id="notes" 
                              placeholder="Enter verification notes"
                              value={verificationNotes}
                              onChange={(e) => setVerificationNotes(e.target.value)}
                              disabled={isProcessing}
                            />
                          </div>
                        </div>
                        
                        {isProcessing && verificationProgress > 0 && (
                          <div className="py-2">
                            <Progress value={verificationProgress} className="h-2" />
                            <p className="text-center text-sm mt-2">Processing verification...</p>
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-2">
                          <Button 
                            onClick={completeManualVerification} 
                            disabled={isProcessing || !verificationAction}
                            className="gap-2"
                          >
                            <ShieldCheck size={16} />
                            Complete Verification
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            ID: {voter.id} • Created: {new Date(voter.verificationTime).toLocaleDateString()}
          </div>
          
          {activeTab === "details" && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
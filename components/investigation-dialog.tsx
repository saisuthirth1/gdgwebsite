"use client"

import { useState } from "react"
import { AlertTriangle, Info } from "lucide-react"
import { VotingPattern } from "@/lib/anomaly-detection"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface InvestigationDialogProps {
  pattern: VotingPattern
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvestigationDialog({ pattern, open, onOpenChange }: InvestigationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Investigation Details</DialogTitle>
          <DialogDescription>
            Detailed analysis of suspicious voting pattern
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Pattern Overview</h3>
              <p className="text-sm text-muted-foreground">
                {pattern.location} - Device ID: {pattern.deviceId}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Verification Attempts</span>
                </div>
                <span className="text-sm font-bold">{pattern.verificationAttempts}</span>
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Unique Voter IDs</span>
                </div>
                <span className="text-sm font-bold">{pattern.voterIds.length}</span>
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Timestamp</span>
                </div>
                <span className="text-sm font-bold">
                  {new Date(pattern.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Voter IDs Involved</h4>
              <div className="grid grid-cols-3 gap-2">
                {pattern.voterIds.map((id) => (
                  <div
                    key={id}
                    className="rounded-md border px-3 py-2 text-sm font-medium"
                  >
                    {id}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  // TODO: Implement block device functionality
                  console.log("Blocking device:", pattern.deviceId)
                  onOpenChange(false)
                }}
              >
                Block Device
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
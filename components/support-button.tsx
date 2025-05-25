"use client"

import { useState } from "react"
import { Headset } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SupportChat } from "@/components/support-chat"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function SupportButton() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40"
              onClick={() => setIsChatOpen(true)}
            >
              <Headset className="h-6 w-6" />
              <span className="sr-only">Technical Support</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Get Technical Support</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SupportChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  )
}


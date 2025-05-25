"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AnomalyVisualizationProps {
  data?: {
    x: number
    y: number
    intensity: number
    type: "multiple_attempt" | "biometric_mismatch" | "unusual_pattern"
  }[]
  patterns?: {
    timestamp: number
    location: string
    deviceId: string
    verificationAttempts: number
    voterIds: string[]
  }[]
  onInvestigate?: (pattern: any) => void
}

export function AnomalyVisualization({ data = [], patterns = [], onInvestigate }: AnomalyVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match display size
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw grid lines
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    // Vertical grid lines
    for (let x = 0; x <= rect.width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }

    // Horizontal grid lines
    for (let y = 0; y <= rect.height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    // Draw anomaly points
    data.forEach(({ x, y, intensity, type }) => {
      const normalizedX = (x * rect.width) / 100
      const normalizedY = (y * rect.height) / 100

      // Draw heatmap circle
      const gradient = ctx.createRadialGradient(
        normalizedX,
        normalizedY,
        0,
        normalizedX,
        normalizedY,
        30
      )

      let color = "rgba(239, 68, 68, " // red for multiple attempts
      if (type === "biometric_mismatch") {
        color = "rgba(245, 158, 11, " // amber for biometric mismatch
      } else if (type === "unusual_pattern") {
        color = "rgba(59, 130, 246, " // blue for unusual patterns
      }

      gradient.addColorStop(0, color + "0.3)")
      gradient.addColorStop(1, color + "0)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(normalizedX, normalizedY, 30, 0, Math.PI * 2)
      ctx.fill()

      // Draw point
      ctx.fillStyle = color.replace("rgba", "rgb").replace(", ", ")")
      ctx.beginPath()
      ctx.arc(normalizedX, normalizedY, 4, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [data])

  return (
    <div className="space-y-6">
      {data.length > 0 && (
        <Card className="p-6">
          <canvas
            ref={canvasRef}
            className="w-full aspect-[16/9] rounded-lg border border-border"
            style={{ touchAction: "none" }}
          />
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <span>Multiple Attempts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500/70" />
              <span>Biometric Mismatch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500/70" />
              <span>Unusual Pattern</span>
            </div>
          </div>
        </Card>
      )}
      
      {patterns.length > 0 && (
        <div className="space-y-4">
          {patterns.map((pattern, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Suspicious Activity Detected</h3>
                  <p className="text-sm text-muted-foreground">{pattern.location}</p>
                </div>
                <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                  {pattern.verificationAttempts} Attempts
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm">
                  Device {pattern.deviceId} has been used for multiple verifications
                  {pattern.voterIds.length > 0 && ` involving ${pattern.voterIds.length} voters`}.
                </p>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onInvestigate?.(pattern)}
                  >
                    Investigate
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
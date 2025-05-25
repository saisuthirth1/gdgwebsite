"use client"

import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Scale,
  TooltipItem,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface VotingChartProps {
  hourlyVotes: number[]
}

export function VotingChart({ hourlyVotes }: VotingChartProps) {
  // Labels for 9 AM to 6 PM (indices 9 to 18)
  const labels = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 9 // 9 AM to 6 PM
    return hour < 12 ? `${hour}:00 AM` : hour === 12 ? "12:00 PM" : `${hour - 12}:00 PM`
  })

  // Data for 9 AM to 6 PM (indices 9 to 18)
  const displayData = hourlyVotes.slice(9, 19) // Slice data for 9 AM to 6 PM

  const chartData = {
    labels,
    datasets: [
      {
        label: "Voter Turnout",
        data: displayData,
        backgroundColor: "#000000", // Black bars
        borderColor: "#000000",
        borderWidth: 1,
        borderRadius: 8, // Rounded corners
        barThickness: 30, // Adjusted for fewer bars
      },
    ],
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      tooltip: {
        backgroundColor: "#ffffff", // White background for the entire tooltip
        titleColor: "#000000", // Black text for the title
        bodyColor: "#000000", // Black text for the body
        borderColor: "#d1d5db", // Gray border
        borderWidth: 1,
        // Increase tooltip size
        titleFont: { size: 16 }, // Larger title font
        bodyFont: { size: 14 }, // Larger body font
        padding: 22, // More padding for a larger tooltip
        cornerRadius: 4, // Slightly rounded corners
        boxPadding: 10, // Space between title and body
        displayColors: false, // Remove color box next to "Verified"
        callbacks: {
          title: (tooltipItems: TooltipItem<"bar">[]) => {
            const index = tooltipItems[0].dataIndex
            const hour = index + 9 // Map back to 24-hour format
            const hourDisplay = hour < 12 ? `${hour}:00` : hour === 12 ? "12:00" : `${hour - 12}:00`
            const period = hour < 12 ? "AM" : "PM"
            return `Hour: ${hourDisplay} ${period}`
          },
          label: (tooltipItem: TooltipItem<"bar">) => {
            return `Verified: ${tooltipItem.raw} voters`
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#374151",
          maxRotation: 0, // No rotation needed for fewer labels
          minRotation: 0,
        },
        grid: {
          display: false,
        },
        afterFit: (scale: Scale) => {
          // Add background color for 11:00 AM (index 2, since 9:00 AM is 0)
          (scale as any)._addedBackgrounds = [
            {
              x: scale.getPixelForTick(2) - scale.width / labels.length / 2,
              width: scale.width / labels.length,
              backgroundColor: "rgba(0, 0, 0, 0.1)", // Gray background
            },
          ]
        },
        beforeDraw: (scale: Scale) => {
          const ctx = scale.chart.ctx
          const backgrounds = (scale as any)._addedBackgrounds
          if (backgrounds) {
            backgrounds.forEach((bg: any) => {
              ctx.fillStyle = bg.backgroundColor
              ctx.fillRect(bg.x, scale.top, bg.width, scale.bottom - scale.top)
            })
          }
        },
      },
      y: {
        beginAtZero: true,
        max: 60,
        ticks: {
          color: "#374151",
          stepSize: 15, // Steps at 15, 30, 45, 60
        },
        grid: {
          color: "#e5e7eb",
        },
      },
    },
  }

  return (
    <div className="h-[300px] shadow-md">
      <Bar data={chartData} options={options} />
    </div>
  )
}
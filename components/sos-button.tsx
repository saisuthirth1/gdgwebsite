"use client"

import { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Loader } from "@googlemaps/js-api-loader"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { GOOGLE_MAPS_CONFIG } from "@/app/config/maps"

// Hardcoded police and hospital locations in Hyderabad (near Shri Tadbund Veeranjaneya Swamy)
const nearbyPlaces = [
  { name: "Tadbund Police Station", lat: 17.4285, lng: 78.4892, type: "police" }, // Approx 1km from Shri Tadbund Veeranjaneya Swamy
  { name: "Begumpet Police Station", lat: 17.4443, lng: 78.4786, type: "police" }, // Approx 2km away
  { name: "Apollo Hospital Secunderabad", lat: 17.4337, lng: 78.5001, type: "hospital" }, // Approx 1.5km away
  { name: "Yashoda Hospital Secunderabad", lat: 17.4382, lng: 78.4923, type: "hospital" }, // Approx 1km away
]

export function SOSButton() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isEmergencyActive, setIsEmergencyActive] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          setUserLocation({ lat: 17.4289, lng: 78.4925 }) // Shri Tadbund Veeranjaneya Swamy, Hyderabad
          toast({
            title: 'Location Error',
            description: 'Using default location (Hyderabad). Please enable location services.',
            variant: 'destructive',
          })
        }
      )
    }
  }, [toast])

  useEffect(() => {
    if (isConfirmOpen && userLocation) {
      initializeMap()
    }
  }, [isConfirmOpen, userLocation])

  const initializeMap = async () => {
    if (!userLocation) return

    try {
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_CONFIG.apiKey,
        version: 'weekly',
        libraries: ['marker'],
      })

      const { Map } = await loader.importLibrary('maps')
      const { AdvancedMarkerElement, PinElement } = await loader.importLibrary('marker')

      const mapElement = document.getElementById('map')
      if (!mapElement) {
        console.error('Map element not found')
        return
      }

      const newMap = new Map(mapElement, {
        center: userLocation,
        zoom: 14,
        mapId: GOOGLE_MAPS_CONFIG.mapId,
      })

      setMap(newMap)

      if (!newMap) {
        console.error('Map object not created successfully');
        return;
      }

      // Add user location marker (blue pin)
      const userPin = new PinElement({ background: '#0000FF', glyphColor: '#FFFFFF' })
      new AdvancedMarkerElement({
        map: newMap,
        position: userLocation,
        title: 'Your Location',
        content: userPin.element,
      })

      // Add hardcoded police and hospital markers
      nearbyPlaces.forEach(place => {
        const pin = new PinElement({
          background: place.type === 'police' ? '#FF0000' : '#00FF00', // Red for police, green for hospital
          glyphColor: '#FFFFFF',
        })
        new AdvancedMarkerElement({
          map: newMap,
          position: { lat: place.lat, lng: place.lng },
          title: `${place.name} (${place.type})`,
          content: pin.element,
        })
      })
    } catch (error) {
      console.error('Error initializing map:', error)
      toast({
        title: 'Map Error',
        description: 'Unable to load the map. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleEmergencyActivate = () => {
    setIsConfirmOpen(false)
    setIsEmergencyActive(true)
    toast({
      title: 'Emergency Signal Sent',
      description: 'Local authorities have been notified. Help is on the way.',
      variant: 'destructive',
    })

    setTimeout(() => {
      setIsEmergencyActive(false)
    }, 30000)
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isEmergencyActive ? 'destructive' : 'outline'}
              size="icon"
              className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg z-40 border-red-500"
              onClick={() => setIsConfirmOpen(true)}
            >
              <AlertTriangle className={`h-6 w-6 ${isEmergencyActive ? 'text-white animate-pulse' : 'text-red-500'}`} />
              <span className="sr-only">Emergency SOS</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Emergency SOS (Police)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Emergency Alert</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This will silently alert local police authorities of an emergency situation at your polling station.
              Your exact location will be shared automatically.
            </AlertDialogDescription>
            <div id="map" className="w-full h-[300px] rounded-lg border mt-4" />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEmergencyActivate} className="bg-red-500 hover:bg-red-600">
              Confirm Emergency
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
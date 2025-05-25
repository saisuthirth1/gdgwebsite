"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/app/firebase/config"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"

interface ConstitutionEntry {
  name: string
  aadhaarNumber: string // Changed from constituency to aadhaarNumber
}

interface ConstitutionListDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ConstitutionListDialog({ isOpen, onClose }: ConstitutionListDialogProps) {
  const [list, setList] = useState<ConstitutionEntry[]>([])
  const [newName, setNewName] = useState("")
  const [newAadhaarNumber, setNewAadhaarNumber] = useState("") // Changed from newConstituency
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchList = async () => {
      if (!isOpen) return
      setLoading(true)
      setError("")
      try {
        const user = auth.currentUser
        if (!user) {
          setError("User not authenticated")
          setLoading(false)
          return
        }

        const userEmail = user.email
        if (!userEmail) {
          setError("User email not found")
          setLoading(false)
          return
        }

        const docRef = doc(db, "constitutionLists", userEmail)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setList(data.list || [])
        } else {
          await setDoc(docRef, { email: userEmail, list: [] })
          setList([])
        }
      } catch (err) {
        console.error(err)
        setError("Failed to fetch list")
      } finally {
        setLoading(false)
      }
    }

    fetchList()
  }, [isOpen])

  const handleAdd = async () => {
    if (!newName || !newAadhaarNumber) {
      setError("Please fill in both fields")
      return
    }

    const user = auth.currentUser
    if (!user || !user.email) {
      setError("User not authenticated")
      return
    }

    const updatedList = [...list, { name: newName, aadhaarNumber: newAadhaarNumber }]
    setList(updatedList)

    try {
      const docRef = doc(db, "constitutionLists", user.email)
      await setDoc(docRef, { email: user.email, list: updatedList })
      setNewName("")
      setNewAadhaarNumber("")
      setError("")
    } catch (err) {
      console.error(err)
      setError("Failed to add entry")
    }
  }

  const handleRemove = async (index: number) => {
    const user = auth.currentUser
    if (!user || !user.email) {
      setError("User not authenticated")
      return
    }

    const updatedList = list.filter((_, i) => i !== index)
    setList(updatedList)

    try {
      const docRef = doc(db, "constitutionLists", user.email)
      await setDoc(docRef, { email: user.email, list: updatedList })
      setError("")
    } catch (err) {
      console.error(err)
      setError("Failed to remove entry")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">Constitution List</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-gray-500 text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className="space-y-4">
            <div className="max-h-64 overflow-y-auto border rounded-md p-2">
              {list.length === 0 ? (
                <p className="text-gray-500 text-center">No entries found.</p>
              ) : (
                list.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 px-2 bg-gray-50 rounded-md mb-2 last:mb-0 shadow-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{entry.name}</p>
                      <p className="text-sm text-gray-600">Aadhaar: {entry.aadhaarNumber}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-gray-700">Name</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter name"
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="aadhaarNumber" className="text-gray-700">Aadhaar Number</Label>
                <Input
                  id="aadhaarNumber"
                  value={newAadhaarNumber}
                  onChange={(e) => setNewAadhaarNumber(e.target.value)}
                  placeholder="Enter Aadhaar number"
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button onClick={handleAdd} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Add Entry
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}